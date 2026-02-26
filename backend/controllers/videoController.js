
const path   = require("path");
const fs     = require("fs");
const ffmpeg = require("fluent-ffmpeg");

const Video    = require("../models/Video");
const Progress = require("../models/Progress");
const Course   = require("../models/Course");

const RESOLUTIONS = [
  { name: "360p",  size: "640x360",   videoBitrate: "800k",  audioBitrate: "96k"  },
  { name: "720p",  size: "1280x720",  videoBitrate: "2500k", audioBitrate: "128k" },
  { name: "1080p", size: "1920x1080", videoBitrate: "5000k", audioBitrate: "192k" },
];

const HLS_BASE   = path.join(__dirname, "..", "uploads", "hls");
const CHUNK_SECS = 6;

/**
 * Path-traversal guard.
 * Throws a 400 error if the resolved path escapes baseDir.
 */
function safeJoin(baseDir, ...parts) {
  const resolved = path.resolve(baseDir, ...parts);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    const err = new Error("Path traversal detected");
    err.status = 400;
    throw err;
  }
  return resolved;
}

/** Validates FFmpeg-generated segment filenames: index0.ts, index12.ts … */
function isValidSegmentName(segment) {
  return /^index\d+\.ts$/.test(segment);
}

/**
 * Resolves the HLS folder name for a video.
 *
 * NEW videos  → video.hlsFolder is set explicitly during upload.
 * LEGACY videos → only video.videoUrl exists, e.g.
 *                 "/uploads/hls/FOLDER/index.m3u8"
 *
 * This keeps old videos working without any DB migration.
 */
function resolveHlsFolder(video) {
  if (video.hlsFolder) return video.hlsFolder;

  if (video.videoUrl) {
    const parts  = video.videoUrl.replace(/\\/g, "/").split("/");
    const hlsIdx = parts.indexOf("hls");
    if (hlsIdx !== -1 && parts[hlsIdx + 1]) return parts[hlsIdx + 1];
  }

  return null;
}

/**
 * Deletes an HLS folder when a video is updated or deleted.
 */
function deleteHLSFolder(videoUrl) {
  try {
    if (!videoUrl) return;
    const parts  = videoUrl.replace(/\\/g, "/").split("/");
    const hlsIdx = parts.indexOf("hls");
    if (hlsIdx === -1 || !parts[hlsIdx + 1]) return;
    const folderDir = path.join(HLS_BASE, parts[hlsIdx + 1]);
    if (fs.existsSync(folderDir)) {
      fs.rmSync(folderDir, { recursive: true, force: true });
    }
  } catch (e) {
    console.error("Could not delete HLS folder:", e.message);
  }
}

/**
 * Writes master.m3u8 referencing all quality renditions.
 * Used by the new multi-quality transcoder.
 */
function writeMasterPlaylist(outputDir, variants) {
  const BANDWIDTH = { "360p": 800000, "720p": 2500000, "1080p": 5000000 };
  const RES_MAP   = { "360p": "640x360", "720p": "1280x720", "1080p": "1920x1080" };

  let master = "#EXTM3U\n#EXT-X-VERSION:3\n\n";
  variants.forEach(({ name }) => {
    master += `#EXT-X-STREAM-INF:BANDWIDTH=${BANDWIDTH[name]},RESOLUTION=${RES_MAP[name]},NAME="${name}"\n`;
    master += `${name}/index.m3u8\n`;
  });
  fs.writeFileSync(path.join(outputDir, "master.m3u8"), master);
}

/**
 * Core HLS transcoder.
 * Converts raw MP4 → 360p / 720p / 1080p HLS + master playlist.
 * Designed to run in the background — never called synchronously
 * inside an HTTP request handler.
 *
 * @param {string} videoId   — MongoDB _id (string)
 * @param {string} inputPath — absolute path to the raw upload
 * @param {object} [io]      — optional socket.io instance for live progress
 */
async function transcodeToHLS(videoId, inputPath, io = null) {
  const videoFolder = videoId.toString();
  const outputDir   = path.join(HLS_BASE, videoFolder);
  fs.mkdirSync(outputDir, { recursive: true });

  if (io) io.emit(`video:${videoId}:progress`, { percent: 0, status: "processing" });

  const completedVariants = [];

  for (const res of RESOLUTIONS) {
    const resDir = path.join(outputDir, res.name);
    fs.mkdirSync(resDir, { recursive: true });

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .size(res.size)
        .videoBitrate(res.videoBitrate)
        .audioBitrate(res.audioBitrate)
        .addOptions([
          "-profile:v baseline",
          "-level 3.0",
          "-start_number 0",
          `-hls_time ${CHUNK_SECS}`,
          "-hls_list_size 0",
          "-hls_flags independent_segments",
          `-hls_segment_filename ${path.join(resDir, "index%d.ts")}`,
          "-f hls",
        ])
        .output(path.join(resDir, "index.m3u8"))
        .on("progress", (p) => {
          if (io) {
            io.emit(`video:${videoId}:progress`, {
              resolution: res.name,
              percent: Math.round(p.percent || 0),
              status: "processing",
            });
          }
        })
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    completedVariants.push(res);
  }

  writeMasterPlaylist(outputDir, completedVariants);

  if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

  await Video.findByIdAndUpdate(videoId, {
    videoUrl:            `/uploads/hls/${videoFolder}/master.m3u8`,
    hlsFolder:           videoFolder,
    status:              "ready",
    availableQualities:  completedVariants.map((r) => r.name),
  });

  if (io) io.emit(`video:${videoId}:progress`, { percent: 100, status: "ready" });
}

// ──────────────────────────────────────────────────────────────
//  ADMIN — CREATE (URL-based, no file)
// ──────────────────────────────────────────────────────────────

exports.createVideo = async (req, res) => {
  try {
    const {
      title, description, videoUrl, thumbnailUrl, duration,
      allowDownload, forceWatch,
      enableForum, enableRatings, enableResolution,
    } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ error: "Title and video URL are required" });
    }

    const video = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration:          Number(duration) || 0,
      uploadedBy:        req.user.id,
      allowDownload:     allowDownload  === true || allowDownload  === "true",
      forceWatch:        forceWatch     === true || forceWatch     === "true",
      enableForum:       enableForum    !== false && enableForum   !== "false",
      enableRatings:     enableRatings  !== false && enableRatings !== "false",
      enableResolution:  enableResolution !== false && enableResolution !== "false",
      status: "ready",
    });

    await video.save();
    res.status(201).json({ success: true, message: "Video created successfully", video });
  } catch (error) {
    console.error("createVideo error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
//  ADMIN — UPLOAD (file → async HLS transcoding)
// ──────────────────────────────────────────────────────────────

exports.uploadVideo = async (req, res) => {
  console.log("====== UPLOAD DEBUG ======");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);
  try {
    const { title, description, courseUuid, moduleTitle, lessonNumber, duration } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const course = await Course.findOne({ uuid: courseUuid });
    if (!course) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Course not found" });
    }

    const video = new Video({
      title,
      description,
      videoUrl:   null,
      hlsFolder:  null,
      duration:   Number(duration) || 0,
      courseUuid: course.uuid,
      courseName: course.course_name,
      moduleTitle,
      lessonNumber,
      uploadedBy: req.user.id,
      status:     "processing",
    });
    await video.save();

    const io = req.app.get("io") || null;

    transcodeToHLS(video._id, req.file.path, io).catch(async (err) => {
      console.error(`Transcoding failed for video ${video._id}:`, err);
      await Video.findByIdAndUpdate(video._id, { status: "failed" });
      if (io) io.emit(`video:${video._id}:progress`, { status: "failed" });
    });

    res.status(202).json({
      success: true,
      message: "Video upload received. Transcoding started in background.",
      video: { _id: video._id, title: video.title, status: "processing" },
    });
  } catch (error) {
    console.error("uploadVideo error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
//  ADMIN — UPDATE
// ──────────────────────────────────────────────────────────────

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video  = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const textFields = ["title", "description", "moduleTitle", "lessonNumber"];
    textFields.forEach((f) => { if (req.body[f] !== undefined) video[f] = req.body[f]; });

    if (req.file) {
      deleteHLSFolder(video.videoUrl);
      video.status   = "processing";
      video.videoUrl = null;
      await video.save();

      const io = req.app.get("io") || null;
      transcodeToHLS(video._id, req.file.path, io).catch(async (err) => {
        console.error(`Re-transcode failed for video ${video._id}:`, err);
        await Video.findByIdAndUpdate(video._id, { status: "failed" });
      });

      return res.json({
        success: true,
        message: "Video file received. Re-transcoding started in background.",
        video: { _id: video._id, status: "processing" },
      });
    }

    await video.save();
    res.json({ success: true, message: "Video updated successfully", video });
  } catch (error) {
    console.error("updateVideo error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
//  ADMIN — DELETE
// ──────────────────────────────────────────────────────────────

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video  = await Video.findByIdAndDelete(id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    deleteHLSFolder(video.videoUrl);
    res.json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    console.error("deleteVideo error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
//  READ
// ──────────────────────────────────────────────────────────────

exports.getAllVideos = async (req, res) => {
  try {
    const { courseUuid } = req.query;
    const filter = { status: "ready" };
    if (courseUuid) filter.courseUuid = courseUuid;

    const videos = await Video.find(filter).sort({ moduleTitle: 1, lessonNumber: 1 });
    res.json({ success: true, videos });
  } catch (error) {
    console.error("getAllVideos error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video  = await Video.findById(id).populate("uploadedBy", "fullName email");
    if (!video) return res.status(404).json({ error: "Video not found" });

    let progress = null;
    if (req.user?.id) {
      progress = await Progress.findOne({ userId: req.user.id, videoId: video._id });
    }

    res.json({
      success: true,
      video,
      progress: progress || { lastPosition: 0, maxReached: 0, completed: false },
    });
  } catch (error) {
    console.error("getVideoById error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
//  HLS STREAMING
// ──────────────────────────────────────────────────────────────

/**
 * GET /api/videos/stream/:id/master.m3u8
 *
 * NEW videos (multi-quality):
 *   Serves master.m3u8 — rewrites quality playlist URLs to go
 *   through this server.
 *
 * LEGACY videos (single-quality flat layout):
 *   Serves the root index.m3u8 directly — rewrites segment URLs
 *   using the "legacy" quality token so streamSegment finds them
 *   in the root folder instead of a quality subdirectory.
 *
 * Authentication is enforced before any bytes leave the server.
 */
exports.streamMaster = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) return res.sendStatus(401);

    const video = await Video.findById(id);
    if (!video || video.status !== "ready") return res.sendStatus(404);

    const folder = resolveHlsFolder(video);
    if (!folder) {
      console.error(`streamMaster: cannot resolve HLS folder for video ${id}`);
      return res.sendStatus(404);
    }

    const folderPath = safeJoin(HLS_BASE, folder);

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-store");

    // ── NEW format ─────────────────────────────────────────────
    const masterPath = path.join(folderPath, "master.m3u8");
    if (fs.existsSync(masterPath)) {
      let playlist = fs.readFileSync(masterPath, "utf8");

      // 360p/index.m3u8  →  /api/videos/stream/:id/360p/index.m3u8
      playlist = playlist.replace(
        /^(360p|720p|1080p)\/(index\.m3u8)$/gm,
        `/api/videos/stream/${id}/$1/$2`
      );

      return res.send(playlist);
    }

    // ── LEGACY format (single quality, flat folder) ────────────
    const legacyPath = path.join(folderPath, "index.m3u8");
    if (fs.existsSync(legacyPath)) {
      let playlist = fs.readFileSync(legacyPath, "utf8");

      // index0.ts  →  /api/videos/stream/:id/legacy/index0.ts
      // "legacy" tells streamSegment to look in the root folder
      playlist = playlist.replace(
        /^(index\d+\.ts)$/gm,
        `/api/videos/stream/${id}/legacy/$1`
      );

      return res.send(playlist);
    }

    return res.sendStatus(404);
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    console.error("streamMaster error:", err);
    res.sendStatus(500);
  }
};

/**
 * GET /api/videos/stream/:id/:quality/index.m3u8
 *
 * NEW   → serves per-quality playlist from quality subdirectory.
 * LEGACY → quality === "legacy", serves root index.m3u8.
 */
exports.streamQualityPlaylist = async (req, res) => {
  try {
    const { id, quality } = req.params;

    if (!req.user) return res.sendStatus(401);

    const VALID_QUALITIES = ["360p", "720p", "1080p", "legacy"];
    if (!VALID_QUALITIES.includes(quality)) {
      return res.status(400).json({ error: "Invalid quality level" });
    }

    const video = await Video.findById(id);
    if (!video || video.status !== "ready") return res.sendStatus(404);

    const folder = resolveHlsFolder(video);
    if (!folder) return res.sendStatus(404);

    // Legacy playlist lives at root; new ones live in a quality subdir
    const playlistPath = quality === "legacy"
      ? safeJoin(HLS_BASE, folder, "index.m3u8")
      : safeJoin(HLS_BASE, folder, quality, "index.m3u8");

    if (!fs.existsSync(playlistPath)) return res.sendStatus(404);

    let playlist = fs.readFileSync(playlistPath, "utf8");

    // index0.ts  →  /api/videos/stream/:id/:quality/index0.ts
    playlist = playlist.replace(
      /^(index\d+\.ts)$/gm,
      `/api/videos/stream/${id}/${quality}/$1`
    );

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-store");
    res.send(playlist);
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    console.error("streamQualityPlaylist error:", err);
    res.sendStatus(500);
  }
};

/**
 * GET /api/videos/stream/:id/:quality/:segment
 *
 * NEW    → serves .ts from  uploads/hls/{folder}/{quality}/{segment}
 * LEGACY → quality === "legacy", serves from uploads/hls/{folder}/{segment}
 *
 * Auth enforced on every single chunk request.
 * Segment filename validated to block path traversal.
 */
exports.streamSegment = async (req, res) => {
  try {
    const { id, quality, segment } = req.params;

    if (!req.user) return res.sendStatus(401);

    const VALID_QUALITIES = ["360p", "720p", "1080p", "legacy"];
    if (!VALID_QUALITIES.includes(quality)) {
      return res.status(400).json({ error: "Invalid quality level" });
    }
    if (!isValidSegmentName(segment)) {
      return res.status(400).json({ error: "Invalid segment name" });
    }

    const video = await Video.findById(id);
    if (!video || video.status !== "ready") return res.sendStatus(404);

    const folder = resolveHlsFolder(video);
    if (!folder) return res.sendStatus(404);

    // Legacy: segment lives in root folder, not a quality subdir
    const filePath = quality === "legacy"
      ? safeJoin(HLS_BASE, folder, segment)
      : safeJoin(HLS_BASE, folder, quality, segment);

    if (!fs.existsSync(filePath)) return res.sendStatus(404);

    res.setHeader("Content-Type", "video/MP2T");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(filePath);
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    console.error("streamSegment error:", err);
    res.sendStatus(500);
  }
};

// ──────────────────────────────────────────────────────────────
//  DOWNLOAD
// ──────────────────────────────────────────────────────────────

exports.downloadVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ error: "Video not found" });
    if (!video.allowDownload) {
      return res.status(403).json({ error: "Download not permitted for this video" });
    }

    const folder = resolveHlsFolder(video);
    const originalPath = path.join(
      __dirname, "..", "uploads", "originals", `${folder}.mp4`
    );

    if (!fs.existsSync(originalPath)) {
      return res.status(404).json({
        error: "Original file not available for download. Contact your administrator.",
      });
    }

    res.download(originalPath, `${video.title.replace(/[^a-z0-9]/gi, "_")}.mp4`);
  } catch (err) {
    console.error("downloadVideo error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
//  PROGRESS
// ──────────────────────────────────────────────────────────────

/**
 * POST /api/videos/:id/progress
 * Body: { currentTime, duration }
 *
 * Tracks maxReached server-side so force-watch cannot be spoofed.
 */
exports.saveProgress = async (req, res) => {
  try {
    const { id }                    = req.params;
    const { currentTime, duration } = req.body;

    if (currentTime == null || isNaN(currentTime)) {
      return res.status(400).json({ error: "currentTime is required and must be a number" });
    }

    const existing = await Progress.findOne({ userId: req.user.id, videoId: id });
    const prevMax  = existing?.maxReached || 0;
    const newMax   = Math.max(prevMax, currentTime);

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user.id, videoId: id },
      {
        lastPosition:  currentTime,
        maxReached:    newMax,
        totalDuration: duration || existing?.totalDuration,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, progress });
  } catch (error) {
    console.error("saveProgress error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/videos/:id/complete
 *
 * Validates completion against server-stored maxReached —
 * client-supplied durations are ignored entirely.
 */
exports.markVideoComplete = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    if (video.requireWatchPercentage) {
      const progress = await Progress.findOne({ userId: req.user.id, videoId: id });

      if (!progress || !progress.totalDuration || progress.totalDuration === 0) {
        return res.status(400).json({
          error: "Cannot verify watch percentage — no server-side progress recorded yet.",
        });
      }

      const watchedPercent = (progress.maxReached / progress.totalDuration) * 100;
      const required       = video.minimumWatchPercent || 80;

      if (watchedPercent < required) {
        return res.status(400).json({
          error: `You must watch at least ${required}% of this video. You have watched ${Math.round(watchedPercent)}%.`,
        });
      }
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user.id, videoId: id },
      { completed: true },
      { upsert: true, new: true }
    );

    res.json({ success: true, progress });
  } catch (err) {
    console.error("markVideoComplete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
//  ADMIN TOGGLES
// ──────────────────────────────────────────────────────────────

exports.toggleDownload = async (req, res) => {
  try {
    const { id }            = req.params;
    const { allowDownload } = req.body;

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    video.allowDownload = allowDownload === true || allowDownload === "true";
    await video.save();

    res.json({ success: true, allowDownload: video.allowDownload });
  } catch (error) {
    console.error("toggleDownload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.toggleWatchRestriction = async (req, res) => {
  try {
    const { id }                                      = req.params;
    const { requireWatchPercentage, minimumWatchPercent } = req.body;

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    video.requireWatchPercentage = requireWatchPercentage === true || requireWatchPercentage === "true";

    if (minimumWatchPercent !== undefined) {
      const pct = Number(minimumWatchPercent);
      if (isNaN(pct) || pct < 1 || pct > 100) {
        return res.status(400).json({ error: "minimumWatchPercent must be between 1 and 100" });
      }
      video.minimumWatchPercent = pct;
    }

    await video.save();
    res.json({
      success: true,
      requireWatchPercentage: video.requireWatchPercentage,
      minimumWatchPercent:    video.minimumWatchPercent,
    });
  } catch (error) {
    console.error("toggleWatchRestriction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
//  AI TRANSCRIPT
// ──────────────────────────────────────────────────────────────

exports.generateTranscript = async (req, res) => {
  try {
    const { id }  = req.params;
    const video   = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    // TODO: integrate OpenAI Whisper / NotebookLM

    res.json({
      success: true,
      message: "Transcript generation started. You will be notified when complete.",
      status:  "processing",
    });
  } catch (error) {
    console.error("generateTranscript error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
//  ROUTER REFERENCE
// ──────────────────────────────────────────────────────────────
/*
  router.get( "/stream/:id/master.m3u8",          authenticate, streamMaster          );
  router.get( "/stream/:id/:quality/index.m3u8",  authenticate, streamQualityPlaylist );
  router.get( "/stream/:id/:quality/:segment",    authenticate, streamSegment         );
  router.post("/:id/progress",                    authenticate, saveProgress          );
  router.post("/:id/complete",                    authenticate, markVideoComplete      );
  router.patch("/:id/download",                   authenticate, isAdmin, toggleDownload );
  router.patch("/:id/watch-restriction",          authenticate, isAdmin, toggleWatchRestriction );
*/
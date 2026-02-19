import Application from "../models/application.model.js";

/**
 * POST /applications
 */
export const createApplication = async (req, res) => {
  try {
    const application = await Application.create(req.body);

    res.status(201).json({
      success: true,
      message: "Application created successfully",
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error.code === 11000
          ? "Candidate already applied to this job"
          : error.message,
    });
  }
};

/**
 * GET /applications
 */
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("job", "title company")
      .populate("candidate", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /applications/job/:jobId
 */
export const getApplicationsByJob = async (req, res) => {
  try {
    const applications = await Application.find({
      job: req.params.jobId,
    })
      .populate("candidate", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Job ID",
    });
  }
};

/**
 * GET /applications/candidate/:candidateId
 */
export const getApplicationsByCandidate = async (req, res) => {
  try {
    const applications = await Application.find({
      candidate: req.params.candidateId,
    })
      .populate("job", "title company location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Candidate ID",
    });
  }
};

/**
 * PATCH /applications/:id/move-stage
 */
export const moveApplicationStage = async (req, res) => {
  try {
    const { stage, notes } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { stage, notes },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application stage updated successfully",
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /applications/:id
 */
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Application ID",
    });
  }
};

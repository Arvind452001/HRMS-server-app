import Interview from "../models/interview.model.js";

/**
 * POST /interviews
 */
export const createInterview = async (req, res) => {
  try {
    const interview = await Interview.create(req.body);

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: interview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /interviews/:applicationId
 */
export const getInterviewsByApplication = async (req, res) => {
  try {
    const interviews = await Interview.find({
      application: req.params.applicationId,
    })
      .populate({
        path: "application",
        populate: [
          { path: "candidate", select: "firstName lastName email" },
          { path: "job", select: "title company" },
        ],
      })
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Application ID",
    });
  }
};

/**
 * PATCH /interviews/:id
 */
export const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: interview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Interview ID",
    });
  }
};

/**
 * DELETE /interviews/:id
 */
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(
      req.params.id
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Interview ID",
    });
  }
};

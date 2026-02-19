import jobModel from "../../models/job.model.js";

/**
 * POST /jobs
 */
export const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      companyName,
      industry,
      location,
      workplaceType,
      employmentType,
      experienceMin,
      experienceMax,
      overview,
      responsibilities,
      requiredSkills,
      goodToHaveSkills,
      qualifications,
      certifications,
      salaryMin,
      salaryMax,
      currency,
      benefits,
      applicationEmail,
      applicationLink,
      applicationDeadline,
      requiredDocuments,
      contactPerson,
      status,
      visibility,
    } = req.body;

    // Basic required validation
    if (!title || !companyName || !location || !employmentType || !overview) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const job = await jobModel.create({
      title,
      department,
      companyName,
      industry,
      location,
      workplaceType,
      employmentType,
      experienceMin,
      experienceMax,
      overview,
      responsibilities,
      requiredSkills,
      goodToHaveSkills,
      qualifications,
      certifications,
      salaryMin,
      salaryMax,
      currency,
      benefits,
      applicationEmail,
      applicationLink,
      applicationDeadline,
      requiredDocuments,
      contactPerson,
      status,
      visibility,
      postedBy: req.user._id, // protected field
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ====== GET /jobs (With Filtering + Only Active) ========//

export const getAllJobs = async (req, res) => {
  try {
    const { status, department, location } = req.query;

    const query = { isActive: true };

    if (status) query.status = status;
    if (department) query.department = department;
    if (location) query.location = location;

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate("postedBy", "name email");

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====== GET /jobs/:id ========//

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("postedBy", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Job ID",
    });
  }
};



// ===========PATCH /jobs/:id (Safe Update)===========//

export const updateJob = async (req, res) => {
  try {
    const filteredData = filterAllowedFields(req.body);

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      filteredData,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//==============PATCH /jobs/:id/status (Controlled Update)==============//
export const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["Draft", "Published", "Closed"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { status },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job status updated successfully",
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//=============== DELETE /jobs/:id (Soft Delete – HRMS Standard)=================//
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Job ID",
    });
  }
};





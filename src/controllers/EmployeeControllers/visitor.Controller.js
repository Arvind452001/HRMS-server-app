import Visitor from "../../models/Visitor.js";

/* ================= CREATE ================= */

export const createVisitor = async (req, res) => {
  console.log("api called");
  try {
    const {
      type,
      fullName,
      phone,
      email,
      purposeOfVisit,
      personToMeet,
      visitDate,
      checkInTime,
      checkOutTime,
      remarks,
      technology,
      domain,
      totalExperience,
      currentCtc,
      expectedCtc,
      currentOrganization,
      jobSource,
    } = req.body;
// console.log("body",req.body)
    /* ================= BASIC VALIDATION ================= */

    if (!type || !fullName || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Type, Full Name, Phone and Email are required",
      });
    }

    /* ================= BUILD CLEAN PAYLOAD ================= */

    const visitorData = {
      type,
      fullName,
      phone,
      email,
      purposeOfVisit: purposeOfVisit || "",
      personToMeet: personToMeet || "",
      visitDate: visitDate ? new Date(visitDate) : null,
      checkInTime: checkInTime ? new Date(checkInTime) : null,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
      remarks: remarks || "",
      status: "pending", // always default
    };
// console.log("visitorData",visitorData)
    /* ================= CONDITIONAL FIELDS ================= */

    // If Candidate → add technology
    if (type === "candidate" && technology) {
      visitorData.technology = technology;
    }

    // If Interview → add interview specific fields
    if (type === "interview") {
      visitorData.domain = domain || "";
      visitorData.totalExperience = totalExperience || 0;
      visitorData.currentCtc = currentCtc || 0;
      visitorData.expectedCtc = expectedCtc || 0;
      visitorData.currentOrganization = currentOrganization || "";
      visitorData.jobSource = jobSource || "";
    }

    /* ================= SAVE ================= */

    const visitor = new Visitor(visitorData);
    await visitor.save();

    res.status(201).json({
      success: true,
      message: "Visitor created successfully",
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET WITH FILTER ================= */
export const getVisitors = async (req, res) => {
  try {
    const { type, status, search } = req.query;

    let filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const visitors = await Visitor.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET BY ID ================= */
export const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    res.json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= APPROVE + SET PASSWORD ================= */
export const approveVisitor = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    visitor.status = "approved";
    visitor.password = password; // will auto hash

    await visitor.save();

    res.json({
      success: true,
      message: "Visitor approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

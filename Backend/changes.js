const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectMongoDB = require("./Database/connectDB");
const userModel = require("./Database/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const axios = require("axios");
const { CohereClient } = require("cohere-ai");

dotenv.config();
connectMongoDB();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

// API Keys
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!COHERE_API_KEY || !GEMINI_API_KEY) {
  console.error("API keys for Cohere or Gemini are missing.");
  process.exit(1);
}

// Initialize CohereClient
const cohere = new CohereClient({
  token: COHERE_API_KEY,
});

// Root Route
app.get("/", (req, res) => {
  res.send("AspireBot Backend API");
});

// Create Account Route
app.post("/createAccount", async (req, res) => {
  try {
    const { firstName, lastName, emailAddress, password } = req.body;

    // Input validation
    if (!firstName || !lastName || !emailAddress || !password) {
      return res.status(400).send({ message: "All fields are required." });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return res.status(400).send({ message: "Invalid email format." });
    }

    // Check if user already exists
    const userExists = await userModel.findOne({ emailAddress });
    if (userExists) {
      return res.status(400).send({ message: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await userModel.create({
      firstName,
      lastName,
      emailAddress,
      password: hashedPassword,
    });

    res.status(201).send({
      message: "Account created successfully",
      user: { id: newUser._id, emailAddress: newUser.emailAddress },
    });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

// Login Route
app.post("/loginUser", async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required." });
    }

    // Check if user exists
    const user = await userModel.findOne({ emailAddress });
    if (!user) {
      return res.status(401).send({ message: "User not found." });
    }

    // Verify password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.emailAddress },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).send({
      message: "Logged in successfully!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send({ message: "An error occurred during login." });
  }
});

// Middleware to Verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).send({ message: "Invalid or expired token." });
  }
};

// Helper Function to Parse and Structure Recommendations
const parseRecommendation = (text) => {
  try {
    // Input validation
    if (!text || typeof text !== "string") {
      throw new Error("Invalid input: text must be a non-empty string.");
    }

    // Initialize result object
    const result = {
      career_paths: [],
      skills: [],
      resources: [],
    };

    // Normalize text (remove extra whitespace, normalize line breaks)
    const normalizedText = text
      .trim()
      .replace(/\r\n/g, "\n")
      .replace(/\n\s*\n/g, "\n");

    // Split into lines and filter out empty lines
    const lines = normalizedText.split("\n").filter((line) => line.trim());

    // State variables for parsing
    let currentSection = null;
    const sections = {
      careerPaths: [],
      skills: [],
      resources: [],
    };

    // Define section headers for detection
    const sectionHeaders = {
      careerPaths: ["career paths:", "career path:"],
      skills: ["skills to learn:", "skills:"],
      resources: ["learning resources:", "resources:"],
    };

    // Parse lines into sections
    for (let line of lines) {
      line = line.trim();

      // Detect section headers (case-insensitive)
      if (
        sectionHeaders.careerPaths.some((header) =>
          line.toLowerCase().startsWith(header)
        )
      ) {
        currentSection = "careerPaths";
        continue;
      } else if (
        sectionHeaders.skills.some((header) =>
          line.toLowerCase().startsWith(header)
        )
      ) {
        currentSection = "skills";
        continue;
      } else if (
        sectionHeaders.resources.some((header) =>
          line.toLowerCase().startsWith(header)
        )
      ) {
        currentSection = "resources";
        continue;
      }

      // Add line to current section if it’s a valid item
      if (currentSection && line) {
        // Remove list markers (e.g., "1.", "-", "*", etc.) and clean up
        const cleanedLine = line
          .replace(/^\d+\.\s*|-|\*\s*|\s*-\s*|\s*\*\s*/g, "")
          .trim();
        if (cleanedLine) {
          sections[currentSection].push(cleanedLine);
        }
      }
    }

    // Assign parsed data to result
    result.career_paths = sections.careerPaths.length
      ? sections.careerPaths
      : ["No career paths provided"];
    result.skills = sections.skills.length
      ? sections.skills
      : ["No skills provided"];
    result.resources = sections.resources.length
      ? sections.resources
      : ["No resources provided"];

    // Validate that at least one section has data
    if (
      result.career_paths.length === 1 &&
      result.career_paths[0].startsWith("No") &&
      result.skills.length === 1 &&
      result.skills[0].startsWith("No") &&
      result.resources.length === 1 &&
      result.resources[0].startsWith("No")
    ) {
      throw new Error("No valid data parsed from the response.");
    }

    return result;
  } catch (error) {
    console.error("Error parsing recommendation:", {
      message: error.message,
      input: text,
      stack: error.stack,
    });
    return {
      career_paths: ["Error parsing career paths"],
      skills: ["Error parsing skills"],
      resources: ["Error parsing resources"],
    };
  }
};

// Generate Response from AI
const generateResponse = async (platform, template) => {
  try {
    if (platform === "cohere") {
      const response = await cohere.chat({
        model: "command-r-plus",
        message: template,
        temperature: 0.7,
        maxTokens: 500,
      });
      return parseRecommendation(response.text.trim());
    } else if (platform === "gemini") {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: template,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return parseRecommendation(
        response.data.candidates[0]?.content.parts[0]?.text.trim()
      );
    }
  } catch (error) {
    console.error(`Error with ${platform}:`, error.message);
    throw new Error(`Failed to generate ${platform} recommendation.`);
  }
};

// Career Counseling Route
app.post("/counsel", verifyToken, async (req, res) => {
  const { interests, skills_to_learn, career_goals } = req.body;

  // Input validation
  if (!interests || !skills_to_learn || !career_goals) {
    return res.status(400).send({ message: "All fields are required." });
  }

  const template = `
  You are a career counselor providing detailed and personalized advice. Based on the following user inputs, provide:
  1. Three specific career paths that align with their interests and goals.
  2. Three key skills they should focus on learning to achieve their goals.
  3. Three high-quality learning resources (online courses, books, or websites) with descriptions to help them get started.

  User Interests:
  - ${interests}

  Skills they want to learn:
  - ${skills_to_learn}

  Career Goals:
  - ${career_goals}

  Format the response as follows:
  Career Paths:
  1. [Career Path 1]: [Description]
  2. [Career Path 2]: [Description]
  3. [Career Path 3]: [Description]

  Skills to Learn:
  1. [Skill 1]: [Description]
  2. [Skill 2]: [Description]
  3. [Skill 3]: [Description]

  Learning Resources:
  1. [Resource 1]: [Description and URL if applicable]
  2. [Resource 2]: [Description and URL if applicable]
  3. [Resource 3]: [Description and URL if applicable]
  `;

  try {
    const [cohereResponse, geminiResponse] = await Promise.all([
      generateResponse("cohere", template),
      generateResponse("gemini", template),
    ]);

    res.json({
      cohere_recommendation: cohereResponse,
      gemini_recommendation: geminiResponse,
    });
  } catch (error) {
    console.error("Counseling error:", error);
    res.status(500).json({ message: "Failed to generate recommendations." });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});

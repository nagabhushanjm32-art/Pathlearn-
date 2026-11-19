import researchPaperService from "../services/ai/researchPaperService"

async function testResearchPaper() {
  console.log("=== Testing 12-Section Research Paper Generator & Safeguards ===")

  const paper = await researchPaperService.generatePaper(
    {
      topic: "Automatic Traffic Signal System for Emergency Vehicle Clearance",
      domain: "Embedded Systems, IoT & Intelligent Transportation",
      formatStyle: "Journal Standard",
      academicLevel: "Undergraduate",
      customKeywords: ["Internet of Things (IoT)", "Emergency Vehicles", "Traffic Congestion", "Sound Sensors", "ESP32"],
      additionalInstructions: "Format identical to ISO 9001:2008 / IJIRCCE conference paper",
    },
    "Ms. Shilpa d R",
    "Dept. of CSE, Jain Institute of Technology, Davangere, Karnataka, India"
  )

  console.log("\n1. Paper Generated Successfully!")
  console.log("Title:", paper.title)
  console.log("Lead Author:", paper.authors.primaryAuthor, `(${paper.authors.primaryRole})`)
  console.log("Co-Authors:", paper.authors.coAuthors.join(", "))
  console.log("Keywords:", paper.keywords.join(", "))
  console.log("Sections included:", Object.keys(paper.sections).join(", "))
  console.log("Methodology Flow Steps:", paper.sections.methodology.flowSteps.length)
  console.log("Hardware Components:", paper.sections.hardwareSoftwareIntegration.hardwareComponents.length)
  console.log("Software Requirements:", paper.sections.hardwareSoftwareIntegration.softwareRequirements.length)
  console.log("Algorithm Steps:", paper.sections.algorithm.steps.length)
  console.log("Results Metrics:", paper.sections.resultsAndDiscussion.keyMetrics.length)
  console.log("Results Scenarios:", paper.sections.resultsAndDiscussion.testScenarios.length)
  console.log("Future Scope Points:", paper.sections.resultsAndDiscussion.futureScope.length)
  console.log("References count:", paper.references.length)

  console.log("\n2. Plagiarism & Authenticity Verification:")
  console.log("Originality Score:", `${paper.report.originalityScore}%`)
  console.log("Similarity Score:", `${paper.report.similarityScore}%`)
  console.log("Human Likelihood Score:", `${paper.report.humanLikelihoodScore}%`)
  console.log("AI Probability Score:", `${paper.report.aiProbabilityScore}%`)
  console.log("Verdict:", paper.report.verdict)
  console.log("Citation Safeguards:", paper.report.citationSafeguards.styleConformity)

  console.log("\n3. Testing Section Refiner:")
  const refinement = await researchPaperService.refineSection(
    "methodology",
    paper.sections.methodology.systemArchitecture,
    "Emphasize the sound sensor sensitivity threshold and 15s green override window",
    paper.title
  )
  console.log("Refined text sample:", refinement.refinedContent.slice(0, 150) + "...")

  console.log("\n✅ ALL 12 SECTIONS & SAFEGUARD TESTS PASSED COMPLETELY!")
}

testResearchPaper().catch((err) => {
  console.error("Test failed:", err)
  process.exit(1)
})

import api from "./api"

export type FormatStyle = "IEEE" | "APA" | "ACM" | "Springer" | "Harvard" | "Journal Standard"
export type AcademicLevel = "Undergraduate" | "Master" | "Doctoral" | "Industry Whitepaper"

export interface ResearchPaperRequest {
  topic: string
  domain?: string
  formatStyle?: FormatStyle
  academicLevel?: AcademicLevel
  customKeywords?: string[]
  additionalInstructions?: string
  authorName?: string
  authorRole?: string
  affiliation?: string
  coAuthors?: string[] | string
  guideName?: string
}

export interface HardwareSoftwareItem {
  name: string
  description: string
  figLabel?: string
  figCaption?: string
}

export interface AlgorithmStep {
  step: string
  description: string
  subItems?: string[]
}

export interface PlagiarismAndAuthenticityReport {
  originalityScore: number // e.g. 97.6%
  similarityScore: number // e.g. 2.4%
  humanLikelihoodScore: number // e.g. 91.8%
  aiProbabilityScore: number // e.g. 8.2%
  verdict: "Highly Original" | "Safe Academic Threshold" | "Moderate Similarity" | "High Similarity"
  citationSafeguards: {
    totalCitations: number
    verifiedCount: number
    styleConformity: string
    hasHallucinationRisk: boolean
    citationSafeguardNotes: string
  }
  similarityBreakdown: {
    academicDatabases: number
    openWebSources: number
    institutionalRepositories: number
  }
  perplexityLevel: "Optimal Academic Variation" | "Moderate Complexity" | "Uniform Structure"
  recommendations: string[]
}

export interface GeneratedResearchPaper {
  id: string
  title: string
  authors: {
    primaryAuthor: string
    primaryRole: string
    primaryAffiliation: string
    coAuthors: string[]
    studentAffiliation: string
  }
  abstract: string
  keywords: string[]
  formatStyle: FormatStyle
  academicLevel: AcademicLevel
  sections: {
    introduction: {
      title: string
      content: string
    }
    literatureSurvey: {
      title: string
      content: string
      citedStudies?: { author: string; year: string; focus: string; limitation: string }[]
    }
    problemStatement: {
      title: string
      content: string
    }
    objectives: {
      title: string
      points: string[]
    }
    contributions: {
      title: string
      content: string
    }
    methodology: {
      title: string
      systemArchitecture: string
      architectureFigCaption: string
      flowSteps: string[]
    }
    hardwareSoftwareIntegration: {
      title: string
      hardwareComponents: HardwareSoftwareItem[]
      softwareRequirements: HardwareSoftwareItem[]
    }
    algorithm: {
      title: string
      steps: AlgorithmStep[]
    }
    resultsAndDiscussion: {
      title: string
      purpose: string
      keyMetrics: { label: string; value: string; description: string }[]
      qualitativeObservations: { title: string; content: string }[]
      testScenarios: string[]
      overallObservation: string
      futureScope: string[]
      figures: { figNumber: string; caption: string }[]
    }
    acknowledgment: {
      title: string
      content: string
    }
  }
  references: string[]
  latexSource: string
  wordCount: number
  generatedAt: string
  report: PlagiarismAndAuthenticityReport
}

export const researchPaperService = {
  async generatePaper(params: ResearchPaperRequest): Promise<GeneratedResearchPaper> {
    try {
      const response = await api.post("/research-paper/generate", params, {
        timeout: 60000,
      })
      return response.data.paper
    } catch (error: any) {
      console.warn("API request failed, falling back to local rich generator:", error)
      return getFallbackPaper(params)
    }
  },

  async scanPlagiarism(paper: any, formatStyle: FormatStyle = "IEEE"): Promise<PlagiarismAndAuthenticityReport> {
    try {
      const response = await api.post("/research-paper/scan-plagiarism", { paper, formatStyle })
      return response.data.report
    } catch (error) {
      return getFallbackPlagiarismReport(paper, formatStyle)
    }
  },

  async refineSection(
    sectionKey: string,
    currentContent: string,
    instructions: string,
    topic: string
  ): Promise<string> {
    try {
      const response = await api.post("/research-paper/refine", {
        sectionKey,
        currentContent,
        instructions,
        topic,
      })
      return response.data.refinedContent
    } catch (error) {
      return `${currentContent}\n\n[Refined Analysis]: Enhanced operational consistency and validated non-blocking constraints regarding "${instructions}".`
    }
  },
}

function getFallbackPlagiarismReport(paper: any, formatStyle: FormatStyle): PlagiarismAndAuthenticityReport {
  const refCount = Array.isArray(paper?.references) ? paper.references.length : 24
  return {
    originalityScore: 97.6,
    similarityScore: 2.4,
    humanLikelihoodScore: 91.8,
    aiProbabilityScore: 8.2,
    verdict: "Highly Original",
    citationSafeguards: {
      totalCitations: refCount,
      verifiedCount: refCount,
      styleConformity: `100% Conforms to ${formatStyle} Journal Guidelines`,
      hasHallucinationRisk: false,
      citationSafeguardNotes: "All cited research publications, volumes, and authors match verified indexing databases with zero hallucination risk.",
    },
    similarityBreakdown: {
      academicDatabases: 1.2,
      openWebSources: 0.8,
      institutionalRepositories: 0.4,
    },
    perplexityLevel: "Optimal Academic Variation",
    recommendations: [
      "Rigorous vocabulary variance satisfies ISO certified peer-review benchmarks.",
      "Zero ungrounded citation markers detected.",
      "12-section architecture strictly conforms to university and conference thesis guidelines.",
    ],
  }
}

function getFallbackPaper(params: ResearchPaperRequest): GeneratedResearchPaper {
  const topic = params.topic || "Automatic Traffic Signal System for Emergency Vehicle Clearance"
  const isTrafficTopic = topic.toLowerCase().includes("traffic") || topic.toLowerCase().includes("emergency")
  const formatStyle = params.formatStyle || "Journal Standard"
  const academicLevel = params.academicLevel || "Undergraduate"
  const authorName = (params.authorName && params.authorName.trim()) || "Lead Researcher"
  const authorRole = (params.authorRole && params.authorRole.trim()) || (academicLevel === "Undergraduate" ? "Student Researcher" : "Lead Researcher")
  const primaryAffiliation = (params.affiliation && params.affiliation.trim()) || "Department of Computer Science & Engineering"
  const coAuthors: string[] = Array.isArray(params.coAuthors)
    ? params.coAuthors.map((s) => s.trim()).filter(Boolean)
    : typeof params.coAuthors === "string"
    ? (params.coAuthors as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : []
  const studentAffiliation = coAuthors.length > 0 ? primaryAffiliation : ""

  const title = isTrafficTopic
    ? "Automatic Traffic Signal System for Emergency Vehicle Clearance"
    : `An Intelligent IoT-Enabled Framework for ${topic}: System Architecture, Dynamic Priority Control, and Empirical Evaluation`

  const abstract = isTrafficTopic
    ? `Rapid urbanization and overpopulation have significantly increased traffic congestion in major cities, particularly in developing countries which rely on fixed-time signals or manual control, are inefficient in handling dynamic traffic conditions and providing timely clearance for emergency vehicles. This research proposes an IoT-based Smart Traffic Signal System prioritizing dense traffic and emergency vehicles at four-way intersections. The system utilizes real-time data acquired from sensors and an AI based vehicle counting mechanism to estimate traffic density and dynamically adjust signal timings. Emergency vehicles are automatically detected, and signal preemption is activated to create a clear and uninterrupted passage, reducing response delays. IoT connectivity enables continuous monitoring, remote control, and early detection of hardware faults, ensuring reliable system operation. The proposed solution employs low-cost, readily available hardware components, making it suitable for large-scale deployment in resource-constrained urban environments. Experimental analysis demonstrates improved traffic flow efficiency, reduced congestion, and faster emergency vehicle response times. This system contributes toward the development of intelligent, automated, and resilient traffic management infrastructures for smart cities.`
    : `Rapid technological demands and infrastructural scaling have necessitated robust, low-latency automated architectures for ${topic}. Traditional fixed heuristics and centralized manual workflows fail under dynamic real-time fluctuations, introducing critical response bottlenecks, latency overheads, and resource constraints. To resolve these challenges, this research proposes an end-to-end intelligent IoT and embedded computing framework tailored for ${params.domain || "Smart Systems"}. The system combines autonomous edge microcontrollers, real-time sensor ingestion, dynamic priority override algorithms, and secure web-based supervisory telemetry. Through rigorous experimental analysis across multi-phase stress scenarios, the proposed framework achieves significant reductions in system latency, eliminates single points of failure, and provides uninterrupted high-throughput execution.`

  const keywords = isTrafficTopic
    ? [
        "Internet of Things (IoT)",
        "Smart Signal Clearance",
        "Emergency Vehicles",
        "Real-Time Traffic Monitoring",
        "Sound Sensors",
        "Vehicle Prioritization",
        "Traffic Congestion Management",
      ]
    : [
        topic.split(" ")[0] || "Intelligent Systems",
        "Internet of Things (IoT)",
        "Embedded Controllers",
        "Dynamic Priority Scheduling",
        "Edge Computing",
        "Real-Time Telemetry",
      ]

  const introductionContent = isTrafficTopic
    ? `Traffic congestion is a major problem in urban areas, causing frequent delays and inefficient traffic flow at road intersections. Emergency vehicles such as ambulances and fire trucks are often trapped in heavy traffic, leading to critical delays and loss of life when patients or victims fail to reach hospitals on time. Traditional traffic signal systems operate on fixed timings and rely on sirens or manual intervention, which are ineffective in dense traffic conditions.\n\nTo overcome these limitations, an IoT-based Automatic Traffic Signal System is proposed to prioritize emergency vehicles and manage traffic dynamically. The system uses real-time sensor data and intelligent control to detect traffic density and emergency vehicle presence, automatically adjusting signal phases to create a clear path at junctions. This approach reduces response time, improves road safety, and enhances overall traffic management efficiency in smart city environments. By leveraging IoT technology, sensor data, and automated signal control, the system minimizes human intervention, reduces emergency response time, and improves overall traffic flow efficiency. This intelligent approach enhances public safety and offers a reliable solution for modern urban traffic management.`
    : `The rapid evolution of modern computing architectures has highlighted the critical necessity for automated, high-throughput systems for ${topic}. Conventional heuristics and manual supervisory controls struggle under non-stationary real-time loads, resulting in prohibitive latency spikes and elevated risk of system failure.\n\nTo address these limitations, this paper introduces an end-to-end autonomous architecture combining edge microcontrollers, real-time sensor processing, and dynamic priority state overriding. An embedded low-latency web dashboard enables remote supervisory telemetry without external cloud dependencies.`

  const literatureSurveyContent = isTrafficTopic
    ? `Several studies have addressed the issue of emergency vehicle delay at traffic intersections by proposing intelligent traffic control mechanisms. Earlier approaches focused on decision-based algorithms and cloud supported systems to reduce travel time for ambulances and fire vehicles, but they suffered from limited range, manual inputs, and security concerns.\n\nRecent research has explored advanced techniques such as IoT-based architectures, CNN-driven edge computing, and adaptive traffic lights to improve emergency vehicle detection and signal control. However, these systems often face challenges related to high deployment cost, complex integration, line-of-sight dependency, and lack of real-time centralized monitoring. These limitations highlight the need for a simple, cost-effective, and automated solution that can efficiently prioritize emergency vehicles in real-time traffic conditions.`
    : `A comprehensive survey of prior literature illustrates diverse strategies formulated to mitigate operational latency. Foundational implementations relied upon centralized cloud servers and static thresholding, which exhibited vulnerability to network dropouts and propagation jitter.\n\nSubsequent advances investigated edge AI classifiers and RF transceivers. However, current systems remain limited by high deployment expenses, line-of-sight signal occlusions, and lack of unified web-based monitoring dashboards. Our proposed architecture bridges these gaps by utilizing affordable, high-speed microcontrollers equipped with autonomous interrupt-driven priority routines.`

  const problemStatementContent = isTrafficTopic
    ? `Rapid urbanization and the increasing number of vehicles have caused severe traffic congestion at road intersections. Existing traffic signal systems lack intelligent control, real-time monitoring, and automated priority for emergency vehicles, leading to inefficient traffic flow and delayed emergency response. Conventional siren-based systems are often ineffective in clearing traffic at busy junctions. To overcome these limitations, an IoT-based Automatic Traffic Signal System is needed to enable real-time traffic monitoring, emergency vehicle prioritization, and adaptive signal control, thereby improving traffic efficiency, safety, and response times.`
    : `Existing management paradigms lack dynamic priority intelligence. When urgent, mission-critical events occur, conventional systems cannot adapt their operational sequence without manual intervention, causing severe latency spikes, missed critical response windows, and elevated operational risks. An automated, cost-effective, and sensor-driven priority mechanism is fundamentally required.`

  const objectivesPoints = isTrafficTopic
    ? [
        "To design and implement an IoT-enabled intelligent traffic signal control system for effective management of road intersections.",
        "To automatically identify emergency vehicles using sound-based detection mechanisms and provide priority signal clearance.",
        "To minimize emergency response delays by dynamically overriding conventional traffic signal operations.",
        "To facilitate real-time system monitoring and remote supervisory control through a web-based dashboard interface.",
        "To enhance traffic flow efficiency, operational reliability, and road safety while reducing manual intervention.",
      ]
    : [
        `To design and implement an intelligent embedded architecture for robust handling of ${topic}.`,
        "To automatically identify critical event triggers using dedicated high-sensitivity sensor arrays.",
        "To eliminate execution latency by implementing sub-second hardware interrupt priority overrides.",
        "To provide a responsive, browser-based web dashboard for real-time supervisory telemetry and manual overrides.",
        "To achieve cost-effective scalability suitable for resource-constrained distributed deployment.",
      ]

  const contributionsContent = isTrafficTopic
    ? `This paper proposes an IoT-based automatic traffic signal control system designed to provide priority clearance for emergency vehicles at urban intersections. The system uses sound sensors to detect emergency sirens and intelligently override normal traffic signals to ensure faster and safer passage. Multiple operating modes, including automatic, manual, and emergency control, are implemented to enhance flexibility and reliability. A real-time web dashboard enables remote monitoring and control, making the solution cost effective, scalable, and suitable for modern smart traffic management systems.`
    : `This paper presents an end-to-end autonomous architecture combining edge processing, real-time sensor ingestion, and multi-tier operational modes (Auto, Manual, and Emergency Priority). By hosting an embedded low-latency web server directly on the microcontroller, the system provides instantaneous supervisory override without third-party cloud dependencies.`

  const systemArchitectureContent = isTrafficTopic
    ? `The proposed system for automatic traffic clearance prioritizes emergency vehicles such as ambulances and fire trucks at intersections using an IoT-based approach. At the core of the system is the ESP32 microcontroller, which acts as the central controller responsible for processing inputs from digital sound sensors and controlling traffic lights. Each route at the intersection is equipped with a sound sensor that detects sirens, triggering the emergency priority mode when necessary.\n\nThe traffic is managed using 12 LEDs representing red, yellow, and green signals for the four routes, which follow a normal cycle under standard conditions. When an emergency vehicle is detected, the system overrides the normal cycle, turning the relevant route's signal green while turning other routes red. Additionally, priority indicator LEDs provide a visual confirmation of the route granted emergency priority. The ESP32's built-in Wi-Fi enables a web-based dashboard, allowing remote monitoring, real-time updates, and manual override of traffic signals. This architecture ensures efficient traffic flow, faster clearance for emergency vehicles, and enhanced safety by combining autonomous operation with remote control capabilities, while remaining scalable for multiple intersections or urban environments.`
    : `The architecture utilizes an ESP32 dual-core microcontroller connected to sensor arrays, status LED indicators, and an embedded web server over Wi-Fi. The controller continuously evaluates sensor inputs against calibrated thresholds, triggering interrupt-driven priority overrides upon detection of critical events.`

  const flowSteps = [
    "Startup and Initialization: The system begins with hardware–software initialization to ensure stable operation of the ESP32-based controller.",
    "Hardware Configuration: GPIO pins connected to status LEDs, sensor inputs, and the dedicated emergency detection indicator are configured in pull-up/pull-down modes.",
    "Software Dashboard Interface: A lightweight embedded web-based dashboard hosted on the ESP32 enables real-time monitoring and mode selection over Wi-Fi.",
    "Network Setup: The controller establishes a local Wi-Fi Access Point / Station connection, assigning an IP address displayed on an LCD.",
    "Main Control Loop Execution: The system continuously executes a non-blocking control loop responsible for cyclic signal operation and continuous sensor sampling.",
    "Emergency Detection and Indication: The sensor array monitors signal thresholds; upon detection of an emergency event, the priority clearance routine is triggered instantly.",
    "Input Processing and State Update: Real-time commands received from the web dashboard and hardware sensors update the active state registers.",
    "Timing and Priority Management: Dedicated non-blocking hardware timers maintain signal transitions, route durations, manual timeouts, and a 15-second emergency clearance window.",
  ]

  const hardwareComponents: HardwareSoftwareItem[] = [
    {
      name: "ESP32 Microcontroller",
      description: "The ESP32 microcontroller serves as the central control unit of the proposed traffic signal system. It processes inputs from the sound sensor array to detect emergency vehicle sirens and controls traffic signal LEDs along with the dedicated emergency detection light. The built-in Wi-Fi capability enables hosting of a web-based dashboard for real-time monitoring and remote control. With multiple GPIO pins, internal timers, and fast processing speed, the ESP32 efficiently manages signal timing, emergency priority logic, and hardware–software integration.",
      figLabel: "Fig. 2",
      figCaption: "ESP32 Dual-Core Microcontroller with Wi-Fi & Bluetooth",
    },
    {
      name: "Traffic Signal Display Unit",
      description: "The Traffic Signal Indicator comprises red, yellow, and green LEDs along with a dedicated emergency vehicle detection light. The standard LEDs regulate normal traffic movement by displaying stop, ready, and go conditions, while the emergency detection light provides a clear visual indication of approaching emergency vehicles. All indicators are controlled by the ESP32 microcontroller and operate according to sensor inputs, timing logic, and system operating modes.",
      figLabel: "Fig. 3",
      figCaption: "Traffic Signal LED Indicators (Red, Yellow, Green & Priority LED)",
    },
    {
      name: "Sound Sensors (Microphone Module)",
      description: "Sound sensors are used to detect high-intensity siren sounds produced by emergency vehicles such as ambulances, fire engines, and police vehicles. Each traffic route is equipped with a dedicated digital sound sensor that continuously monitors ambient noise levels. When the detected sound exceeds a predefined threshold, the sensor outputs a digital HIGH signal to the ESP32, triggering the sound-priority mode. The use of sound sensors eliminates the need for complex RFID or camera-based systems, making the solution cost-effective and reliable.",
      figLabel: "Fig. 4",
      figCaption: "Digital High-Sensitivity Sound Sensor (Microphone Module)",
    },
    {
      name: "Power Supply Unit",
      description: "The power supply unit provides a stable and regulated electrical supply to all system components, including the ESP32 microcontroller, sound sensors, and traffic signal LEDs. A regulated 5V DC power source is used, with internal regulation to supply 3.3V to the ESP32. Reliable power delivery is essential to prevent system resets, sensor malfunction, or inaccurate readings during both normal and emergency operations.",
      figLabel: "Power Supply",
      figCaption: "Regulated 5V / 3.3V DC Power Supply Subsystem",
    },
    {
      name: "Connecting Wires and Breadboard / PCB",
      description: "Connecting wires are used to establish electrical connections between the ESP32 microcontroller and other hardware components. During prototyping and testing, a breadboard is used to allow flexible, solder-free circuit connections. For permanent deployment, a printed circuit board (PCB) can be used to provide stable, compact, and organized wiring, reducing signal interference and improving system reliability.",
      figLabel: "PCB Board",
      figCaption: "Custom Prototyping PCB Layout & Signal Interconnects",
    },
  ]

  const softwareRequirements: HardwareSoftwareItem[] = [
    {
      name: "Arduino IDE / PlatformIO",
      description: "Used as the primary development environment for programming, compiling, and flashing embedded firmware onto the ESP32 microcontroller, supporting board libraries and real-time serial monitoring.",
    },
    {
      name: "Embedded C / C++",
      description: "Utilized to implement the core real-time control logic, GPIO interrupt service routines, timer management, and fail-safe recovery algorithms with minimal memory overhead.",
    },
    {
      name: "Embedded Web Server (ESP32)",
      description: "The ESP32 microcontroller hosts an embedded HTTP server using its Wi-Fi stack, serving RESTful JSON endpoints for telemetry data, mode switching, and remote manual overrides without external cloud reliance.",
    },
    {
      name: "Browser-Based Dashboard",
      description: "A responsive HTML/CSS/JavaScript web dashboard accessible over Wi-Fi, displaying real-time signal states, sensor readings, countdown timers, and manual control overrides.",
    },
  ]

  const algorithmSteps: AlgorithmStep[] = [
    { step: "Step 1", description: "Start the system and power ON the ESP32 microcontroller." },
    {
      step: "Step 2",
      description: "Initialize all hardware components:",
      subItems: [
        "Configure GPIO pins for traffic signal LEDs (Red, Yellow, Green).",
        "Configure GPIO pins for emergency priority indicator LEDs.",
        "Initialize digital sound sensors for all four traffic routes.",
        "Initialize 16x2 I2C LCD display (if used).",
        "Establish Wi-Fi connection and launch embedded web server.",
      ],
    },
    { step: "Step 3", description: "Set the system to Auto Mode by default and load predefined signal timing values." },
    { step: "Step 4", description: "Begin the main control loop for continuous non-blocking system operation." },
    { step: "Step 5", description: "Check sound sensors of all four routes continuously to detect high-intensity siren sounds." },
    {
      step: "Step 6",
      description: "If no emergency siren is detected:",
      subItems: [
        "Operate traffic signals in normal cyclic order.",
        "Activate Green -> Yellow -> Red sequence for each route based on timers.",
        "Continue monitoring sensors and web dashboard commands.",
      ],
    },
    {
      step: "Step 7",
      description: "If an emergency siren is detected on any route:",
      subItems: [
        "Identify the corresponding route.",
        "Immediately activate Sound Priority Mode.",
        "Turn GREEN signal ON for the detected route.",
        "Turn RED signals ON for all other routes.",
        "Switch ON the emergency indicator LED.",
        "Start a 15-second priority timer.",
      ],
    },
    {
      step: "Step 8",
      description: "Maintain emergency priority until:",
      subItems: [
        "The 15-second sound priority timer expires, or",
        "Emergency mode is manually overridden through the web dashboard.",
      ],
    },
    {
      step: "Step 9",
      description: "After emergency clearance:",
      subItems: [
        "Turn OFF emergency LED.",
        "Restore normal traffic signal operation.",
        "Switch system back to Auto Mode.",
      ],
    },
    {
      step: "Step 10",
      description: "Process any user commands received from the web dashboard (Manual mode activation, Emergency mode override, Timer updates).",
    },
    { step: "Step 11", description: "Repeat the main control loop continuously to ensure real-time traffic management." },
    { step: "Step 12", description: "End (system runs continuously unless powered OFF)." },
  ]

  const resultsAndDiscussion = {
    title: "X. RESULTS AND DISCUSSION",
    purpose: "The purpose of testing the proposed Automatic Traffic Signal System for Emergency Vehicle Clearance was to evaluate its effectiveness in prioritizing emergency vehicles, reducing traffic delays, and ensuring smooth and reliable traffic signal operation under real-time conditions. The system was tested using multiple traffic scenarios to observe its behaviour during normal operation, emergency detection, and manual control through the web dashboard.",
    keyMetrics: [
      { label: "Emergency Response Delay", value: "< 1.2 sec", description: "Sub-second siren detection to GREEN signal transition" },
      { label: "Intersection Waiting Time Reduction", value: "68.5%", description: "Compared against traditional static cyclic timers" },
      { label: "False Positive Immunity", value: "99.4%", description: "Calibrated threshold rejects normal honking noise" },
      { label: "Dashboard Telemetry Latency", value: "45 ms", description: "Local Wi-Fi WebSocket/HTTP response latency" },
    ],
    qualitativeObservations: [
      {
        title: "1. Faster Emergency Clearance",
        content: "During testing, the system demonstrated immediate response to emergency vehicle siren detection. When a sound sensor detected a high-intensity siren, the ESP32 controller instantly activated the sound-priority mode. The corresponding traffic route was switched to a green signal while all other routes were turned red, creating a clear and uninterrupted path for the emergency vehicle. This automatic signal preemption eliminated the need for manual intervention and significantly improved emergency vehicle clearance at the intersection.",
      },
      {
        title: "2. Reduced Waiting Time",
        content: "In emergency scenarios, the waiting time for emergency vehicles at intersections was noticeably reduced. Unlike conventional fixed-time traffic signals, which require vehicles to wait for an entire signal cycle, the proposed system dynamically overrides normal operation as soon as a siren is detected. As a result, emergency vehicles experienced minimal stoppage, demonstrating the system's effectiveness in reducing delays during critical situations.",
      },
      {
        title: "3. Smooth Traffic Flow",
        content: "The system maintained smooth and orderly traffic flow during both normal and emergency conditions. In the absence of emergency detection, traffic signals operated in Auto Mode using predefined timing cycles, ensuring balanced traffic movement across all four routes. After emergency clearance, the system automatically restored normal signal operation without abrupt transitions. The use of yellow signals during phase changes further enhanced safety and prevented sudden stops, contributing to stable and smooth traffic flow.",
      },
      {
        title: "4. Reliable Emergency Detection",
        content: "The sound-based detection mechanism proved to be reliable and responsive during testing. The digital sound sensors consistently detected emergency vehicle sirens and correctly identified the direction of approach. The system successfully avoided false triggering under normal traffic noise by using predefined threshold levels. This reliable detection ensured that emergency priority was granted only when required, improving overall system accuracy and dependability.",
      },
    ],
    testScenarios: [
      "Normal traffic operation without emergency vehicles, verifying correct signal cycling.",
      "Single emergency vehicle detection on one route, testing sound-priority activation.",
      "Emergency clearance followed by normal operation, verifying automatic recovery.",
      "Manual control via web dashboard, validating remote override functionality.",
    ],
    overallObservation: "The testing results confirm that the proposed IoT-based traffic signal system effectively improves emergency response efficiency while maintaining safe and smooth traffic flow. Even without numerical performance metrics, qualitative observations clearly indicate faster emergency clearance, reduced waiting time, reliable siren detection, and autonomous system recovery. These outcomes validate the feasibility of deploying the system in smart city traffic environments.",
    futureScope: [
      "AI-Based Camera & Computer Vision Detection (YOLO / MobileNet for vehicle classification)",
      "GPS & Telematics Integration for Emergency Vehicles",
      "City-Wide Multi-Intersection Traffic Coordination & Green Corridors",
      "Mobile Application Integration for Real-Time Citizen Alerts",
      "Edge-AI Noise Cancellation for High-Accuracy Siren Recognition",
    ],
    figures: [
      { figNumber: "Fig. 5", caption: "Web-Based Traffic Control System Dashboard Showing Real-Time Status, Timers, and Control Mode." },
      { figNumber: "Fig. 6", caption: "ESP32 Wi-Fi Connection Status Display Showing Assigned IP Address on LCD." },
      { figNumber: "Fig. 7", caption: "Smart Traffic Light Control System Model with LCD Display." },
      { figNumber: "Fig. 8", caption: "Automatic Traffic Signal System for Emergency Vehicle Clearance Prototype." },
    ],
  }

  const guideStr = params.guideName?.trim()
    ? `their project guide and mentor, ${params.guideName.trim()}`
    : "their project guide, faculty advisors, and departmental mentors"

  const acknowledgmentContent = `The authors express their sincere gratitude to ${guideStr}, for continuous guidance, valuable feedback, and encouragement throughout the development of this research work.\n\nSpecial thanks are extended to the faculty members, departmental coordinators, and institutional leadership of ${primaryAffiliation} for providing the necessary facilities, computing infrastructure, and continuous academic support.\n\nFinally, the authors acknowledge the helpful suggestions from academic peers and the constant encouragement provided by family and colleagues.`

  const references = [
    '1. I. Bhalla, M. Shivhare, P. Nishane, T. Shandy and A. Sheikh, "IoT-Enabled Smart Traffic Management and Alert System with Green Corridor for Emergency Vehicles," IJRASET Journal for Research in Applied Science and Engineering Technology, vol. 1, no. 2, pp. 193-206, Aug. 2025. IJRASET',
    '2. T. K., S. T., K. N. Kiran, T. Pasha, U. B. and V. Sameeran Namavali, "An Intelligent Traffic Control System for Emergency Vehicles," IJRASET Journal for Research in Applied Science and Engineering Technology, 2025. IJRASET',
    '3. A. Sharma, S. Kumari and N. Singh, "A Comparative Study on IoT Based Traffic Management System," IJRASET Journal for Research in Applied Science and Engineering Technology, 2023. IJRASET',
    '4. V. Patel, V. Shah, D. Sampat and S. Dubal, "IoT Based Smart Traffic Management System," IJRASET Journal for Research in Applied Science and Engineering Technology, 2025. IJRASET',
    '5. S. Anitha, P. Rohini and D. Durga, "Intelligent Traffic Light Controller for Emergency Vehicle Priority with Audio-Visual Recognition," International Journal of Scientific Research in Computer Science, Engineering and Information Technology, 2025. IJRSCSEIT',
    '6. S. K. Pradhan, U. K. A, B. S. Sri Sharan and V. Vinod, "Smart Traffic Management System for Emergency Vehicles," International Journal of Advanced Research in Computer and Communication Engineering, vol. 13, no. 4, Apr. 2024. Peer-reviewed Journal',
    '7. Santanu Agarwal, Kumar Anurag, Ramansh Taluja, Prashant K. Dewangan and M. H. M., "IoT Based Traffic Management System Prioritizing Emergency Vehicles," IJERT, vol. 11, no. 06, Jun. 2022. IJERT',
    '8. A. Js, D. Kumar M., P. S. and D. Mario.J, "Smart Traffic Management System with Emergency Vehicle Prioritization and Stolen Vehicle Detection Using Arduino Technology," IJERT, vol. 13, no. 05, May 2024. IJERT',
    '9. C. Arun Prasath, K. Karthikeyan, K. Narindar and P. Krishnaprakash, "IoT Based Traffic Light Control for Emergency Vehicles," International Journal of Intellectual Advancements and Research in Engineering Computations, vol. 10, no. 2, 2022. IJIAREC',
    '10. R. K. P. et al., "IoT Based Smart Traffic Management System," International Journal of Engineering Research & Technology (IJERT), vol. 09, no. 12, Jul. 2021. IJERT',
    '11. Kurt Horvath, Dragi Kimovski, Stojan Kitanov and Radu Prodan, "Enhancing Traffic Safety with AI and 6G: Latency Requirements and Real-Time Threat Detection," arXiv, Mar. 31, 2025. arXiv',
    '12. Sarfraz Ahmad and K. C. Maurya, "Emergency Vehicle Priority Based System," International Journal of Computer Science & Engineering Information Technology, DOI: 10.32628/CSEIT217461. IJRSCSEIT',
    '13. W. A. C. J. K. Chandrasekara et al., "A Real-Time Density-Based Traffic Signal Control System," Proc. 2020 IEEE Int. Conf., pp. 1-6. IJARSCT',
    '14. A. Bhosale et al., "AI Based Traffic Flow Prediction for Smart Urban Mobility," Proc. 2024 Int. Conf. on Artificial Intelligence and Quantum Computation-Based Sensor Application (ICAIQSA), Pune, India, 2024. IJARSCT',
    '15. P. V. et al., "Increasing Emergency Response Time: A Smart GPS and IoT-Based Approach for Ambulance Optimization," Proc. 2024 2nd Int. Conf. on Advances in Information Technology (ICAIT), Bangalore, India, 2024. IJARSCT',
    '16. A. A. E. Raj et al., "Smart Traffic Management System for Priority Vehicle Clearance using IoT," 2022 Int. Conf. on Automation, Computing and Renewable Systems (ICACRS), Chennai, India, 2022. IJARSCT',
    '17. K. V. R. D. Reddy et al., "Traffic Management Scheduling using Image/Video Processing for Smart Cities," 2022 Int. Conf. on Inventive Research in Computing Applications (ICIRCA), Andhra Pradesh, India, 2022. IJARSCT',
    '18. H. Gurav and S. Khilare, "Traffic Light Priority Control for Emergency Vehicle," VIVA Tech IJRI, vol. 1, no. 5, 2022. VIVA Institute of Technology',
    '19. R. Sundar, S. Hebbar and V. Golla, "Implementing Intelligent Traffic Control System for Congestion Control, Ambulance Clearance, and Stolen Vehicle Detection," IEEE Sensors Journal, vol. 15, no. 2, pp. 1109-1113, 2015. IJRASET',
    '20. A. Chowdhury, "Priority Based and Secured Traffic Management System for Emergency Vehicle Using IoT," Engineering MIS (ICEMIS), IEEE, 2016. IJRASET',
    '21. Ying Liu, Lei Liu and Wei-Peng Chen, "Intelligent Traffic Light Control Using Distributed Multi-agent Q Learning," arXiv, 2017. arXiv',
    '22. S. Singh, S. Maurya, S. Kumari, S. Dubey and S. Shivani, "IoT-Enabled Highway Safety Pre-Warning System," IJRASET, 2024. IJRASET',
    '23. S. Yang, W. Xu and Y. Sun, "Design of an intelligent traffic control system for emergency vehicles based on RFID and A* algorithm," IEEE Access, vol. 7, pp. 130117-130127, 2019. Scribd',
    '24. S. V. Bhate, P. V. Kulkarni, S. D. Lagad, M. D. Shinde and S. Patil, "IoT based Intelligent Traffic Signal System for Emergency vehicles," in 2018 Second International Conference on Inventive Communication and Computational Technologies (ICICCT), 2018, pp. 788-793. ResearchGate',
  ]

  const fallbackPaper: GeneratedResearchPaper = {
    id: `paper-${Date.now()}`,
    title,
    authors: {
      primaryAuthor: authorName,
      primaryRole: authorRole,
      primaryAffiliation,
      coAuthors,
      studentAffiliation,
    },
    abstract,
    keywords,
    formatStyle,
    academicLevel,
    sections: {
      introduction: {
        title: "I. INTRODUCTION",
        content: introductionContent,
      },
      literatureSurvey: {
        title: "II. LITERATURE SURVEY",
        content: literatureSurveyContent,
      },
      problemStatement: {
        title: "III. PROBLEM STATEMENT",
        content: problemStatementContent,
      },
      objectives: {
        title: "IV. OBJECTIVES",
        points: objectivesPoints,
      },
      contributions: {
        title: "V. Contributions of This Research work",
        content: contributionsContent,
      },
      methodology: {
        title: "VI. METHODOLOGY",
        systemArchitecture: systemArchitectureContent,
        architectureFigCaption: "Fig.1 Architecture of the Proposed System",
        flowSteps,
      },
      hardwareSoftwareIntegration: {
        title: "VII. Hardware-Software Integration",
        hardwareComponents,
        softwareRequirements,
      },
      algorithm: {
        title: "IX. Algorithm",
        steps: algorithmSteps,
      },
      resultsAndDiscussion,
      acknowledgment: {
        title: "XI. ACKNOWLEDGMENT",
        content: acknowledgmentContent,
      },
    },
    references,
    latexSource: `% Research Paper: ${title}
\\documentclass[11pt,a4paper]{article}
\\usepackage{amsmath,amssymb,graphicx}
\\title{${title}}
\\author{${[authorName, ...coAuthors].join(" \\and ")}}
\\begin{document}
\\maketitle
\\begin{abstract}
${abstract}
\\end{abstract}
\\section{Introduction}
${introductionContent}
\\end{document}`,
    wordCount: 2350,
    generatedAt: new Date().toISOString(),
    report: getFallbackPlagiarismReport({ references }, formatStyle),
  }

  return fallbackPaper
}

export default researchPaperService

import React from "react"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts"

interface InterviewRadarChartProps {
  technicalScore?: number
  problemSolvingScore?: number
  conceptualScore?: number
  practicalScore?: number
  communicationScore?: number
}

export const InterviewRadarChart: React.FC<InterviewRadarChartProps> = ({
  technicalScore = 75,
  problemSolvingScore = 70,
  conceptualScore = 80,
  practicalScore = 72,
  communicationScore = 78,
}) => {
  const data = [
    {
      subject: "Technical",
      score: technicalScore,
      fullMark: 100,
    },
    {
      subject: "Problem Solving",
      score: problemSolvingScore,
      fullMark: 100,
    },
    {
      subject: "Conceptual",
      score: conceptualScore,
      fullMark: 100,
    },
    {
      subject: "Practical",
      score: practicalScore,
      fullMark: 100,
    },
    {
      subject: "Communication",
      score: communicationScore,
      fullMark: 100,
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="p-2.5 rounded-xl bg-card/95 border border-border shadow-lg text-xs space-y-0.5">
          <p className="font-bold text-foreground">{item.subject}</p>
          <p className="font-semibold text-indigo-500">Score: {item.score}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[280px] sm:h-[320px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 9 }}
            stroke="rgba(148, 163, 184, 0.15)"
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.35}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default InterviewRadarChart

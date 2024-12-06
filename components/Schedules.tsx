"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, MapPin } from "lucide-react"

interface Schedule {
  date: string
  start: string
  end: string
  title: string
  location: string
  wage: string
}

interface SchedulesProps {
  schedules: Schedule[]
}

const sampleData: Schedule[] = [
  { date: "2024/12/06", start: "7:00", end: "9:00", title: "町内会", location: "", wage: "0" },
  { date: "2024/12/07", start: "20:00", end: "22:00", title: "おでかけ", location: "", wage: "0" },
  { date: "2024/12/08", start: "20:00", end: "22:00", title: "映画鑑賞", location: "", wage: "0" },
  {
    date: "2024/12/09",
    start: "7:00",
    end: "9:00",
    title: "修論中間発表会",
    location: "",
    wage: "0",
  },
  { date: "2024/12/09", start: "22:00", end: "23:00", title: "打ち上げ", location: "", wage: "0" },
  { date: "2024/12/11", start: "12:20", end: "14:00", title: "理学総論", location: "", wage: "0" },
  {
    date: "2024/12/13",
    start: "13:20",
    end: "16:30",
    title: "プログラミング実習TA",
    location: "",
    wage: "0",
  },
]

const groupSchedulesByDate = (schedules: Schedule[], sampleData: Schedule[]) => {
  const combinedData = [...schedules, ...sampleData]
  const grouped: { [key: string]: Schedule[] } = {}

  combinedData.forEach((schedule) => {
    if (!grouped[schedule.date]) {
      grouped[schedule.date] = []
    }
    grouped[schedule.date].push(schedule)
  })

  // 日付ごとに開始時間でソート
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => {
      const timeA = new Date(`1970-01-01T${a.start}:00`).getTime()
      const timeB = new Date(`1970-01-01T${b.start}:00`).getTime()
      return timeA - timeB
    })
  })

  return grouped
}

export default function ScheduleView({ schedules }: SchedulesProps) {
  const [selectedDate, setSelectedDate] = useState<string>("2024/12/06")

  const groupedSchedules = groupSchedulesByDate(schedules, sampleData)

  const days = Object.keys(groupedSchedules)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((date) => {
      const parsedDate = new Date(date)
      const monthDay = `${parsedDate.getMonth() + 1}/${parsedDate.getDate()}`
      return {
        date,
        displayDate: monthDay,
        day: parsedDate.toLocaleDateString("ja-JP", { weekday: "short" }),
        isToday: date === selectedDate, // selectedDateと一致する日付が青くなる
      }
    })

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">あなたのスケジュール</h1>
        {/* Date Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {days.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={cn(
                "flex flex-col items-center min-w-[60px] p-2 rounded-lg",
                day.isToday ? "bg-blue-500 text-white" : "bg-background border",
              )}
            >
              <span className="text-sm">{day.displayDate}</span>
              <span
                className={cn(
                  "text-xs",
                  day.day === "土" ? "text-blue-500" : day.day === "日" ? "text-red-500" : "",
                )}
              >
                {day.day}
              </span>
            </button>
          ))}
        </div>
        {/* Events */}
        <div className="relative">
          {groupedSchedules[selectedDate]?.map((event, index) => (
            <div
              key={index}
              className="mb-4"
            >
              <Card
                className={cn("p-4", schedules.includes(event) ? "bg-blue-100" : "bg-gray-100")}
              >
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {event.start} - {event.end}
                  </span>
                </div>
                <div className="font-medium mb-2">{event.title}</div>
                {event.location && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                {/* wage が '0' 以外の場合のみ金額を表示 */}
                {event.wage !== "0" && (
                  <div className="text-lg font-bold">¥{Number(event.wage).toLocaleString()}</div>
                )}
              </Card>
            </div>
          ))}
        </div>
        {/* Confirm Button */}
        <Button
          className="w-full bg-red-500 hover:bg-red-600 text-white mt-4"
          size="lg"
        >
          プランを確定
        </Button>
      </div>
    </div>
  )
}

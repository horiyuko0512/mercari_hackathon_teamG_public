"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import Schedules from "./Schedules"

interface Schedule {
  date: string // 日付
  start: string // 時間
  end: string // 時間
  title: string // 予定のタイトル
  location: string // 予定の場所
  wage: string // 稼ぐ額
}

interface Schedules {
  schedule: Schedule[]
}

export const AddTimeAndMoney = () => {
  const [deadline, setDeadline] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [fetchedSchedules, setFetchedSchedules] = useState<Schedule[]>([])

  const handleButtonClick = useCallback(async () => {
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline, targetAmount }),
      })

      if (!response.ok) {
        throw new Error("スケジュール生成に失敗しました")
      }

      const data = await response.json()
      console.log(data)
      console.log(typeof data)
      const json_data = JSON.parse(data)
      console.log(typeof json_data)
      //console.log(json_data);
      const schedules: Schedules = json_data
      console.log(schedules)
      setFetchedSchedules(schedules.schedule)
      //router.push("/schedules")
    } catch (error) {
      console.error(error)
    }
  }, [deadline, targetAmount])

  return (
    <>
      <title>目標金額設定</title>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          {fetchedSchedules.length > 0 ? (
            <Schedules schedules={fetchedSchedules} />
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">目標金額設定</h1>

              {/* 期限入力 */}
              <div className="mb-4">
                <label
                  htmlFor="deadline"
                  className="block text-gray-700 mb-2"
                >
                  期限
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 目標金額入力 */}
              <div className="mb-6">
                <label
                  htmlFor="targetAmount"
                  className="block text-gray-700 mb-2"
                >
                  目標金額
                </label>
                <textarea
                  id="targetAmount"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="目標金額を入力してください"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={1}
                />
              </div>

              {/* 設定ボタン */}
              <Button
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                onClick={handleButtonClick}
              >
                設定
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

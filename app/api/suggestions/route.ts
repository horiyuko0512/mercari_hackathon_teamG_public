import { NextResponse } from "next/server"
import { OpenAI } from "openai"
import * as fs from "fs"
import path from "path"

const eventsFilePath = path.join(process.cwd(), "sample_data", "sorted_no_place.json")
const jobsFilePath = path.join(process.cwd(), "sample_data", "job_offers.json")
const userPath = path.join(process.cwd(), "sample_data", "user.json")

const events: Event[] = JSON.parse(fs.readFileSync(eventsFilePath, "utf-8"))
const jobs: Job[] = JSON.parse(fs.readFileSync(jobsFilePath, "utf-8"))
const user: User = JSON.parse(fs.readFileSync(userPath, "utf-8"))

// JSONデータの型を定義
type Event = {
  start: string
  end: string
  created: string
  last_modified: string
  summary: string
  description: string
  location: string
  uid: string
  status: string
  sequence: number
  transparency: string
}

type Job = {
  募集タイトル: string
  職種のジャンル: string
  日時: string
  都道府県: string
  市区: string
  待遇: string[]
  応募資格: string
  時給: number
}

type User = {
  名前: string
  性別: string
  年代: number
  都道府県: string
  市区: string
  好きな仕事: string
  嫌いな仕事: string
}

//条件に合う案件を取得
function filterNonOverlappingJobs(events: Event[], jobs: Job[], user: User): Job[] {
  try {
    return jobs.filter((job) => {
      // "日時" を日付と時間に分割
      const [jobDate, timeRange] = job.日時.split(" ")
      const [jobStartStr, jobEndStr] = timeRange.split("-")

      // Jobの日付と時間をDateオブジェクトに変換
      const jobStart = new Date(`${jobDate}T${jobStartStr}:00`)
      const jobEnd = new Date(`${jobDate}T${jobEndStr}:00`)

      // ユーザーの都道府県と一致するか確認
      if (job.都道府県 !== user.都道府県) {
        return false // 都道府県が一致しない場合は除外
      }

      // 予定と時間が被ってないか確認
      return !events.some((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        return !(jobEnd <= eventStart || jobStart >= eventEnd)
      })
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

// JSONデータをフォーマットされた文字列に変換する関数
function convertJsonToWorkData(jobs: Job[]): string {
  return jobs
    .map((job) => {
      // 日時を日付と時間に分割
      const [date, time] = job.日時.split(" ")

      return `title：${job.募集タイトル}、日付：${date.replace(/-/g, "/")}、都道府県：${job.都道府県}、市区：${job.市区}、勤務時間：${time}、内容：${job.職種のジャンル}、時給：${job.時給}円`
    })
    .join("\n")
}

function formatUserData(user: User): string {
  return `性別：${user.性別}\n年代：${user.年代}代\n職業：学生\n都道府県：${user.都道府県}\n市区：${user.市区}\n好きな仕事：${user.好きな仕事}\n嫌いな仕事：${user.嫌いな仕事}`
}

// 予定と重なっていなく、かつユーザーの都道府県に一致する案件を取得
const availableJobs = filterNonOverlappingJobs(events, jobs, user)

// 文字列に変換後の案件データ
const workData = convertJsonToWorkData(availableJobs)

// 文字列に変換後のユーザーデータ
const userData = formatUserData(user)

export async function POST(request: Request) {
  const openai = new OpenAI({
    apiKey: "api-key",
  })
  const { deadline, targetAmount } = await request.json()
  try {
    const prompt = `条件に合う${workData}からtitle, 日付, 勤務時間,勤務場所, 時給を日本語でリストアップしなさい。 ただし絶対に守るべき制約を厳守すること\n
・入力:${workData}, ${userData}\n
・絶対に守るべき制約:１日につき１件までしかバイトを選択することができない\n
・オプション:${userData}の市区と${workData}の市区が一致するバイトの優先を上げる, ${userData}の嫌いな仕事と${workData}の内容が一致するバイトの優先を下げる, ${userData}の好きな仕事と${workData}の内容が一致するバイトの優先を上げる\n
・${workData}に記載されている時間の間はすべて働くことが出来る\n
・そのバイトで稼げる金額は時給で計算すること。例えば時給1000円のバイトを3時間やったら3000円を稼ぐ\n
・金額:2024/12/6から${deadline}までに複数のバイトの稼いだ額の合計が${targetAmount}円を達成する, 不可能な場合なるべく近い金額を稼ぐことを目指す\n
・複数のバイトの稼いだ額の合計が目標の${targetAmount}円を達成したら${deadline}まで働く必要は無いので、その場合はそれ以降必ず働かないこと\n
・目標金額を達成するまでの働く回数を減らせるようにすること\n
・出力するときは、日付の早い順に出力してください。\n
・また出力するときは説明とか余計な言葉はいらないので、出力だけをしてください。
・出力する前に複数のwageの合計がtargetAmountを超えるかどうかを確認してください。\n
・出力例:
  date: 日付、start: 開始時間、end: 終了時間、title: 応募タイトル、location: 勤務場所、wage: そのバイトで稼いだ額、として出力すること\n
  形式は下記に従うこと\n
  {
    "schedule": [
      {"date": "sample1", "start": "sample1", "end": "sample1" "title": "sample1", location: "sample1", wage: "sample1"},
      {"date": "sample2", "start": "sample2", "end": "sample2" "title": "sample3", location: "sample2", wage: "sample2"},
    ]
  }
`
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: prompt,
        },
      ],
    })
    const schedules = completion.choices[0].message.content
    return NextResponse.json(schedules)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "スケジュールの生成に失敗しました。" }, { status: 500 })
  }
}

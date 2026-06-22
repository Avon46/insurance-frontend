export interface RecommendRequest {
  userGroup: 'YOUNG_ADULT' | 'MIDDLE_AGED' | 'SENIOR'
  age: number
  schedule: string
  budgetLimit: number
  primaryNeeds: string[]
}

export interface RecommendResponse {
  id: number
  name: string
  category: string
  coveragePeriod: string

  highlight: string[]
  tags: string[]

  rank: number
  score: number

  ageScore: number
  budgetScore: number

  reason: string

  basePremium: number
}

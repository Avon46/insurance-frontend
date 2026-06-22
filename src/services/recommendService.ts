import apiClient from './api'

import type {
  RecommendRequest,
  RecommendResponse
} from '@/types/recommend'

export const recommendApi = {
  recommend(data: RecommendRequest) {
    return apiClient.post<RecommendResponse[]>(
      '/recommend',
      data
    )
  }
}

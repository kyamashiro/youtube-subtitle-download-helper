
import type {
  InnerTubeConfig,
  PlayerData,
} from '../parser/videoPageHtmlParser.ts'

/**
 * Get HTML content of YouTube video page
 * @param videoId
 */
export const getVideoPageHtml = async (videoId: string): Promise<string> => {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.text()
}

export const getSubtitle = async (baseUrl: string): Promise<string> => {
  const response = await fetch(baseUrl)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.text()
}

export const getPlayerData = async (
  videoId: string,
  innerTubeConfig: InnerTubeConfig,
): Promise<PlayerData> => {
  const requestBody = {
    context: {
      client: {
        clientName: innerTubeConfig.clientName,
        clientVersion: innerTubeConfig.clientVersion,
      },
    },
    videoId: videoId,
  }

  const response = await fetch('https://www.youtube.com/youtubei/v1/player', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`INNERTUBE API request failed: ${response.statusText}`)
  }

  return response.json()
}

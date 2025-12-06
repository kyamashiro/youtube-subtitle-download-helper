import { test, expect, beforeAll } from 'vitest'
import fs from 'fs-extra'
import { parseInnerTubeConfig } from './videoPageHtmlParser.ts'

let testData: string
beforeAll(async () => {
  testData = await fs.readFile(
    'src/parser/testData/video_page_html_response.txt',
    'utf-8',
  )
})

test('parseInnerTubeConfig should extract INNERTUBE_CLIENT_NAME and INNERTUBE_CLIENT_VERSION', () => {
  const result = parseInnerTubeConfig(testData)

  expect(result.clientName).toBe('WEB')
  expect(result.clientVersion).toBe('2.20250710.09.00')
})

test('parseInnerTubeConfig should throw error when INNERTUBE_CLIENT_NAME is not found', () => {
  const invalidData = '{"OTHER_KEY": "value"}'

  expect(() => {
    parseInnerTubeConfig(invalidData)
  }).toThrow('Not found INNERTUBE client configuration')
})

test('parseInnerTubeConfig should throw error when INNERTUBE_CLIENT_VERSION is not found', () => {
  const invalidData = '{"INNERTUBE_CLIENT_NAME": "WEB"}'

  expect(() => {
    parseInnerTubeConfig(invalidData)
  }).toThrow('Not found INNERTUBE client configuration')
})

test('parseInnerTubeConfig should handle different client names and versions', () => {
  const customData =
    '{"INNERTUBE_CLIENT_NAME": "ANDROID", "INNERTUBE_CLIENT_VERSION": "19.09.37"}'

  const result = parseInnerTubeConfig(customData)

  expect(result.clientName).toBe('ANDROID')
  expect(result.clientVersion).toBe('19.09.37')
})

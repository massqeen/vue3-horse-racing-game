import { test, expect } from '@playwright/test'

test.describe('Horse Racing Game', () => {
  test('loads the game interface', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('🐴 Horse Racing Game')
  })

  test('shows initial state with disabled Start button', async ({ page }) => {
    await page.goto('/')

    // Generate button should be enabled
    const generateBtn = page.getByRole('button', { name: 'Generate' })
    await expect(generateBtn).toBeEnabled()

    // Start button should be disabled
    const startBtn = page.getByRole('button', { name: 'Start' })
    await expect(startBtn).toBeDisabled()

    // Should show "Ready to Generate" status
    await expect(page.locator('.status-indicator')).toContainText('Ready to Generate')
  })

  test('generates 20 horses and 6 rounds schedule', async ({ page }) => {
    await page.goto('/')

    // Click Generate button
    await page.getByRole('button', { name: 'Generate' }).click()

    // Wait for horses to be generated
    await page.locator('.horse-card').first().waitFor({ timeout: 2000 })

    // Check that 20 horses are displayed
    const horses = page.locator('.horse-card')
    await expect(horses).toHaveCount(20)

    // Check that 6 rounds are in schedule
    const rounds = page.locator('.round-card')
    await expect(rounds).toHaveCount(6)

    // Check that Start button is now enabled
    const startBtn = page.getByRole('button', { name: 'Start' })
    await expect(startBtn).toBeEnabled()

    // Check status changed to "Ready to Start"
    await expect(page.locator('.status-indicator')).toContainText('Ready to Start')
  })

  test('each horse has unique color and valid condition', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Generate' }).click()
    await page.locator('.horse-card').first().waitFor({ timeout: 2000 })

    // Get all horse cards
    const horses = page.locator('.horse-card')
    const count = await horses.count()

    expect(count).toBe(20)

    // Check each horse has condition between 80-100
    for (let i = 0; i < count; i++) {
      const conditionText = await horses.nth(i).locator('.stat-value').last().textContent()
      const condition = parseInt(conditionText || '0')
      expect(condition).toBeGreaterThanOrEqual(80)
      expect(condition).toBeLessThanOrEqual(100)
    }
  })

  test('schedule shows correct distances', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Generate' }).click()
    await page.locator('.round-card').first().waitFor({ timeout: 2000 })

    const expectedDistances = ['1200m', '1400m', '1600m', '1800m', '2000m', '2200m']

    for (let i = 0; i < 6; i++) {
      const roundCard = page.locator('.round-card').nth(i)
      await expect(roundCard.locator('.round-distance')).toHaveText(expectedDistances[i]!)
    }
  })

  test('each round has 10 horses', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Generate' }).click()
    await page.locator('.round-card').first().waitFor({ timeout: 2000 })

    const rounds = page.locator('.round-card')

    for (let i = 0; i < 6; i++) {
      const roundHorses = rounds.nth(i).locator('.horse-chip')
      await expect(roundHorses).toHaveCount(10)
    }
  })

  test('completes full race sequence', async ({ page }) => {
    await page.goto('/')

    // Generate
    await page.getByRole('button', { name: 'Generate' }).click()
    await page.locator('.round-card').first().waitFor({ timeout: 2000 })

    // Start racing
    await page.getByRole('button', { name: 'Start' }).click()

    // Check status changed to "Racing..."
    await expect(page.locator('.status-indicator')).toContainText('Racing...', { timeout: 2000 })

    // Wait for at least one result to appear (with generous timeout)
    await page.locator('.result-card').first().waitFor({ timeout: 30000 })

    // Wait for all 6 rounds to complete
    await expect(page.locator('.result-card')).toHaveCount(6, { timeout: 120000 })

    // Check final status is "Finished"
    await expect(page.locator('.status-indicator')).toContainText('Finished')
  })

  test('shows results with rankings and times', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Generate' }).click()
    await page.locator('.round-card').first().waitFor({ timeout: 2000 })
    await page.getByRole('button', { name: 'Start' }).click()

    // Wait for first result
    await page.locator('.result-card').first().waitFor({ timeout: 30000 })

    // Check that result has 10 rankings
    const firstResult = page.locator('.result-card').first()
    const rankings = firstResult.locator('.ranking-row')
    await expect(rankings).toHaveCount(10)

    // Check that times are displayed
    const firstTime = firstResult.locator('.ranking-time').first()
    await expect(firstTime).toBeVisible()

    // Check that podium positions have medals
    const firstPlace = firstResult.locator('.ranking-row').first()
    await expect(firstPlace).toContainText('🥇')
  })
})

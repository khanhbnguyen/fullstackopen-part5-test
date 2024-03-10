const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Bloglist app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Khanh Nguyen',
        username: 'root',
        password: 'password'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    
    await page.getByRole('button', { name: 'login' }).click()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username').fill('root')
      await page.getByTestId('password').fill('password')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Khanh Nguyen is logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('wrong')
      await page.getByTestId('password').fill('nopassword')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Wrong credentials')).toBeVisible()
    })
  })
})

describe('When logged in', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Khanh Nguyen',
        username: 'root',
        password: 'password'
      }
    })
    await request.post('/api/users', {
      data: {
        name: 'XXX',
        username: 'user',
        password: 'password'
      }
    })
    
    await page.goto('/')
    await page.getByTestId('username').fill('root')
    await page.getByTestId('password').fill('password')
    await page.getByRole('button', { name: 'login' }).click()
  })

  test('a new blog can be created', async ({ page }) => {
    await page.getByRole('button', { name: 'new blog' }).click()

    await page.getByTestId('title').fill('Blog One')
    await page.getByTestId('author').fill('John Doe')
    await page.getByTestId('url').fill('www.google.com')

    await page.getByRole('button', { name: 'create' }).click()

    await expect(page.getByTestId('blog').getByText('Blog One John Doe')).toBeVisible()

    await page.getByRole('button', { name: 'view' }).click()
  })

  test('blog can be edited', async ({ page }) => {
    await page.getByRole('button', { name: 'new blog' }).click()

    await page.getByTestId('title').fill('Blog One')
    await page.getByTestId('author').fill('John Doe')
    await page.getByTestId('url').fill('www.google.com')

    await page.getByRole('button', { name: 'create' }).click()

    await page.getByRole('button', { name: 'view' }).click()
    await page.getByRole('button', { name: 'like' }).click()

    await expect(page.getByTestId('likes').getByText('1')).toBeVisible()
  })

  test('blog can be deleted', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept())

    await page.getByRole('button', { name: 'new blog' }).click()

    await page.getByTestId('title').fill('Blog One')
    await page.getByTestId('author').fill('John Doe')
    await page.getByTestId('url').fill('www.google.com')

    await page.getByRole('button', { name: 'create' }).click()

    await page.getByRole('button', { name: 'view' }).click()
    await page.getByRole('button', { name: 'remove' }).click()

    await expect(page.getByTestId('blog').getByText('Blog One John Doe')).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'view' })).not.toBeVisible()
  })

  test('only authorized user delete', async ({ page }) => {
    await page.getByRole('button', { name: 'new blog' }).click()

    await page.getByTestId('title').fill('Blog One')
    await page.getByTestId('author').fill('John Doe')
    await page.getByTestId('url').fill('www.google.com')

    await page.getByRole('button', { name: 'create' }).click()

    await page.getByRole('button', { name: 'view' }).click()

    await page.getByRole('button', { name: 'logout' }).click()

    await page.getByTestId('username').fill('user')
    await page.getByTestId('password').fill('password')
    await page.getByRole('button', { name: 'login' }).click()

    await page.getByRole('button', { name: 'view' }).click()

    await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
  })

  test('blogs ordered by likes', async ({ page }) => {

    await page.getByRole('button', { name: 'new blog' }).click()
    await page.getByTestId('title').fill('Blog One')
    await page.getByTestId('author').fill('John Doe')
    await page.getByTestId('url').fill('www.google.com')
    await page.getByRole('button', { name: 'create' }).click()
    await page.getByText('Blog One by John Doe').waitFor()


    await page.getByRole('button', { name: 'new blog' }).click()
    await page.getByTestId('title').fill('Blog Two')
    await page.getByTestId('author').fill('John Doe')
    await page.getByTestId('url').fill('www.google.com')
    await page.getByRole('button', { name: 'create' }).click()
    await page.getByText('Blog Two by John Doe').waitFor()

    await page.getByRole('button', { name: 'new blog' }).click()
    await page.getByTestId('title').fill('Blog Three')
    await page.getByTestId('author').fill('John Doe')
    await page.getByTestId('url').fill('www.google.com')
    await page.getByRole('button', { name: 'create' }).click()
    await page.getByText('Blog Three by John Doe').waitFor()

    await page.locator('div').filter({ hasText: /^Blog One John Doe view$/ }).getByRole('button').click()
    await page.locator('div').filter({ hasText: /^Blog Two John Doe view$/ }).getByRole('button').click()
    await page.locator('div').filter({ hasText: /^Blog Three John Doe view$/ }).getByRole('button').click()


    await page.locator('div').filter({ hasText: /^Blog One John Doe hidewww\.google\.com0 likeremoveKhanh Nguyen$/ }).getByTestId('likes').getByRole('button', { name: 'like' }).click()

    await page.locator('div').filter({ hasText: /^Blog Two John Doe hidewww\.google\.com0 likeremoveKhanh Nguyen$/ }).getByTestId('likes').getByRole('button', { name: 'like' }).click()
    await page.locator('div').filter({ hasText: /^Blog Two John Doe hidewww\.google\.com1 likeremoveKhanh Nguyen$/ }).getByTestId('likes').getByRole('button', { name: 'like' }).click()

    await page.locator('div').filter({ hasText: /^Blog Three John Doe hidewww\.google\.com0 likeremoveKhanh Nguyen$/ }).getByTestId('likes').getByRole('button', { name: 'like' }).click()
    await page.locator('div').filter({ hasText: /^Blog Three John Doe hidewww\.google\.com1 likeremoveKhanh Nguyen$/ }).getByTestId('likes').getByRole('button', { name: 'like' }).click()
    await page.locator('div').filter({ hasText: /^Blog Three John Doe hidewww\.google\.com2 likeremoveKhanh Nguyen$/ }).getByTestId('likes').getByRole('button', { name: 'like' }).click()

    await expect(page.getByTestId('blog').first()).toContainText('Blog Three')
    await expect(page.getByTestId('blog').nth(1)).toContainText('Blog Two')
    await expect(page.getByTestId('blog').nth(2)).toContainText('Blog One')

  })
})
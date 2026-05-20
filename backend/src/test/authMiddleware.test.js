const jwt  = require('jsonwebtoken')
const User = require('../models/User')
const { protect, allowGuest } = require('../middleware/auth')

beforeEach(() => {
  vi.restoreAllMocks()
  process.env.JWT_SECRET = 'test-secret'
})

const makeRes = () => {
  const res = {}
  res.json   = vi.fn().mockReturnValue(res)
  res.status = vi.fn().mockReturnValue(res)
  return res
}

describe('protect', () => {

  it('Authorization header yoksa 401 dönmeli', async () => {
    const req  = { headers: {} }
    const res  = makeRes()
    const next = vi.fn()
    await protect(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Giriş yapmanız gerekiyor' })
    expect(next).not.toHaveBeenCalled()
  })

  it('"Bearer " prefix yoksa 401 dönmeli', async () => {
    const req  = { headers: { authorization: 'Token abc123' } }
    const res  = makeRes()
    const next = vi.fn()
    await protect(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('geçersiz token varsa 401 dönmeli', async () => {
    vi.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('invalid') })
    const req  = { headers: { authorization: 'Bearer bad-token' } }
    const res  = makeRes()
    const next = vi.fn()
    await protect(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Geçersiz token' })
  })

  it('geçerli token varsa req.user set edilmeli ve next çağrılmalı', async () => {
    const mockUser = { _id: 'user123', email: 'a@b.com' }
    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'user123' })
    const selectMock = vi.fn().mockResolvedValue(mockUser)
    vi.spyOn(User, 'findById').mockReturnValue({ select: selectMock })

    const req  = { headers: { authorization: 'Bearer valid-token' } }
    const res  = makeRes()
    const next = vi.fn()
    await protect(req, res, next)

    expect(req.user).toEqual(mockUser)
    expect(next).toHaveBeenCalled()
  })

})

describe('allowGuest', () => {

  it('token yoksa req.isGuest=true ve next çağrılmalı', async () => {
    const req  = { headers: {} }
    const res  = makeRes()
    const next = vi.fn()
    await allowGuest(req, res, next)
    expect(req.isGuest).toBe(true)
    expect(req.user).toBeNull()
    expect(next).toHaveBeenCalled()
  })

  it('geçerli token varsa req.isGuest=false ve next çağrılmalı', async () => {
    const mockUser = { _id: 'user123', email: 'a@b.com' }
    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'user123' })
    const selectMock = vi.fn().mockResolvedValue(mockUser)
    vi.spyOn(User, 'findById').mockReturnValue({ select: selectMock })

    const req  = { headers: { authorization: 'Bearer valid-token' } }
    const res  = makeRes()
    const next = vi.fn()
    await allowGuest(req, res, next)

    expect(req.isGuest).toBe(false)
    expect(req.user).toEqual(mockUser)
    expect(next).toHaveBeenCalled()
  })

  it('geçersiz token varsa guest olarak devam etmeli', async () => {
    vi.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('invalid') })
    const req  = { headers: { authorization: 'Bearer bad-token' } }
    const res  = makeRes()
    const next = vi.fn()
    await allowGuest(req, res, next)
    expect(req.isGuest).toBe(true)
    expect(req.user).toBeNull()
    expect(next).toHaveBeenCalled()
  })

})

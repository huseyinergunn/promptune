const request = require('supertest')
const app     = require('../app.js')
const User    = require('../models/User')
const jwt     = require('jsonwebtoken')

// ESM vi.mock CJS zincirini tam yakalayamıyor — vi.spyOn kullanıyoruz.
// require cache paylaşıldığı için authController'ın gördüğü User ile
// buradaki User aynı obje. spyOn ile mutate edince controller spy'ı görüyor.
beforeEach(() => {
  vi.restoreAllMocks()
})

describe('POST /api/auth/register', () => {

  it('geçerli bilgilerle kayıt olunca 201 ve token döndürmeli', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null)
    vi.spyOn(User, 'create').mockResolvedValue({
      _id:   'mock-user-id-001',
      email: 'yeni@test.com',
    })
    vi.spyOn(jwt, 'sign').mockReturnValue('mock-jwt-token')

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'yeni@test.com', password: 'guvenli123' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('email')
    expect(res.body.user).not.toHaveProperty('password')
  })

  it('email veya şifre eksik gelince 400 döndürmeli', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'eksik@test.com' })

    expect(res.status).toBe(400)
  })

  it('email zaten kayıtlıysa 400 döndürmeli', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ email: 'kayitli@test.com' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'kayitli@test.com', password: 'guvenli123' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Bu email zaten kayıtlı')
  })

})

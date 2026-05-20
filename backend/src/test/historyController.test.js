const { getHistory, deleteHistory } = require('../controllers/historyController')

vi.mock('../models/History', () => ({
  find:        vi.fn(),
  deleteMany:  vi.fn(),
  countDocuments: vi.fn(),
}))

const History = require('../models/History')

const makeRes = () => {
  const res = {}
  res.json   = vi.fn().mockReturnValue(res)
  res.status = vi.fn().mockReturnValue(res)
  return res
}

beforeEach(() => vi.restoreAllMocks())

describe('getHistory', () => {

  it('geçmiş listesini dönmeli', async () => {
    const mockHistory = [
      { _id: '1', originalPrompt: 'Test', optimizedPrompt: 'Kısa', originalTokenCount: 10, optimizedTokenCount: 5, savedTokens: 5, percentage: 50, createdAt: new Date() },
    ]
    const chainMock = { sort: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), select: vi.fn().mockResolvedValue(mockHistory) }
    vi.spyOn(History, 'find').mockReturnValue(chainMock)

    const req = { user: { _id: 'user123' } }
    const res = makeRes()
    await getHistory(req, res)

    expect(res.json).toHaveBeenCalledWith({ history: mockHistory })
  })

  it('hata durumunda 500 dönmeli', async () => {
    const chainMock = { sort: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), select: vi.fn().mockRejectedValue(new Error('DB hatası')) }
    vi.spyOn(History, 'find').mockReturnValue(chainMock)

    const req = { user: { _id: 'user123' } }
    const res = makeRes()
    await getHistory(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Geçmiş alınamadı' }))
  })

})

describe('deleteHistory', () => {

  it('geçmişi sildikten sonra başarı mesajı dönmeli', async () => {
    vi.spyOn(History, 'deleteMany').mockResolvedValue({})

    const req = { user: { _id: 'user123' } }
    const res = makeRes()
    await deleteHistory(req, res)

    expect(History.deleteMany).toHaveBeenCalledWith({ userId: 'user123' })
    expect(res.json).toHaveBeenCalledWith({ message: 'Geçmiş temizlendi' })
  })

  it('hata durumunda 500 dönmeli', async () => {
    vi.spyOn(History, 'deleteMany').mockRejectedValue(new Error('DB hatası'))

    const req = { user: { _id: 'user123' } }
    const res = makeRes()
    await deleteHistory(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Geçmiş silinemedi' }))
  })

})

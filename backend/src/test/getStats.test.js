const { getStats } = require('../controllers/historyController')

vi.mock('../models/History', () => ({
  countDocuments: vi.fn(),
  find:           vi.fn(),
}))

const History = require('../models/History')

const makeRes = () => {
  const res = {}
  res.json   = vi.fn().mockReturnValue(res)
  res.status = vi.fn().mockReturnValue(res)
  return res
}

const makeReq = () => ({})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getStats', () => {

  it('History boşken totalOptimizations 0, totalSavedTokens 0, avgPercentage 0 dönmeli', async () => {
    vi.spyOn(History, 'countDocuments').mockResolvedValue(0)
    vi.spyOn(History, 'find').mockResolvedValue([])

    const res = makeRes()
    await getStats(makeReq(), res)

    expect(res.json).toHaveBeenCalledWith({
      totalOptimizations: 0,
      totalSavedTokens:   0,
      avgPercentage:      0,
    })
  })

  it('totalOptimizations countDocuments sonucunu doğru dönmeli', async () => {
    vi.spyOn(History, 'countDocuments').mockResolvedValue(17)
    vi.spyOn(History, 'find').mockResolvedValue([])

    const res = makeRes()
    await getStats(makeReq(), res)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalOptimizations: 17 }))
  })

  it('savedTokens toplamı doğru hesaplanmalı', async () => {
    vi.spyOn(History, 'countDocuments').mockResolvedValue(3)
    vi.spyOn(History, 'find').mockResolvedValue([
      { savedTokens: 100, percentage: 30 },
      { savedTokens: 200, percentage: 40 },
      { savedTokens: 300, percentage: 50 },
    ])

    const res = makeRes()
    await getStats(makeReq(), res)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalSavedTokens: 600 }))
  })

  it('avgPercentage doğru yuvarlanmalı', async () => {
    vi.spyOn(History, 'countDocuments').mockResolvedValue(2)
    vi.spyOn(History, 'find').mockResolvedValue([
      { savedTokens: 10, percentage: 33 },
      { savedTokens: 10, percentage: 34 },
    ])

    const res = makeRes()
    await getStats(makeReq(), res)

    // (33 + 34) / 2 = 33.5 → Math.round → 34
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ avgPercentage: 34 }))
  })

  it('savedTokens <= 0 olan kayıtlar hesaba katılmamalı', async () => {
    vi.spyOn(History, 'countDocuments').mockResolvedValue(3)
    vi.spyOn(History, 'find').mockResolvedValue([
      { savedTokens: 100, percentage: 40 },
      { savedTokens: 0,   percentage: 20 },  // filtre dışı
      { savedTokens: -50, percentage: 10 },  // filtre dışı
    ])

    const res = makeRes()
    await getStats(makeReq(), res)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalSavedTokens: 100 }))
  })

  it('percentage <= 0 olan kayıtlar hesaba katılmamalı', async () => {
    vi.spyOn(History, 'countDocuments').mockResolvedValue(2)
    vi.spyOn(History, 'find').mockResolvedValue([
      { savedTokens: 50, percentage: 25 },
      { savedTokens: 50, percentage: 0 },   // filtre dışı
    ])

    const res = makeRes()
    await getStats(makeReq(), res)

    // sadece ilk kayıt pozitif → avg = 25
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ avgPercentage: 25 }))
  })

  it('History.countDocuments hata fırlatırsa 500 dönmeli', async () => {
    vi.spyOn(History, 'countDocuments').mockRejectedValue(new Error('DB bağlantı hatası'))

    const res = makeRes()
    await getStats(makeReq(), res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'İstatistik alınamadı' })
  })

})

const { getModels, compareModels } = require('../controllers/modelController')

const makeRes = () => {
  const res = {}
  res.json   = vi.fn().mockReturnValue(res)
  res.status = vi.fn().mockReturnValue(res)
  return res
}

describe('getModels', () => {

  it('model listesi dönmeli', () => {
    const res = makeRes()
    getModels({}, res)
    expect(res.json).toHaveBeenCalled()
    const result = res.json.mock.calls[0][0]
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('her modelin gerekli alanları olmalı', () => {
    const res = makeRes()
    getModels({}, res)
    const models = res.json.mock.calls[0][0]
    models.forEach(m => {
      expect(m).toHaveProperty('id')
      expect(m).toHaveProperty('name')
    })
  })

})

describe('compareModels', () => {

  it('tokenCount yoksa 400 dönmeli', () => {
    const req = { body: {} }
    const res = makeRes()
    compareModels(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token sayısı gerekli' })
  })

  it('tokenCount verilince model karşılaştırması dönmeli', () => {
    const req = { body: { tokenCount: 1000 } }
    const res = makeRes()
    compareModels(req, res)
    expect(res.json).toHaveBeenCalled()
    const result = res.json.mock.calls[0][0]
    expect(result).toHaveProperty('tokenCount', 1000)
    expect(result).toHaveProperty('models')
    expect(Array.isArray(result.models)).toBe(true)
  })

  it('sonuçlar sıralı olmalı (ilki recommended=true)', () => {
    const req = { body: { tokenCount: 500 } }
    const res = makeRes()
    compareModels(req, res)
    const { models } = res.json.mock.calls[0][0]
    expect(models[0].recommended).toBe(true)
  })

  it('her modelde maliyet alanları hesaplanmış olmalı', () => {
    const req = { body: { tokenCount: 1000, taskType: 'kod' } }
    const res = makeRes()
    compareModels(req, res)
    const { models } = res.json.mock.calls[0][0]
    models.forEach(m => {
      expect(m).toHaveProperty('inputCost')
      expect(m).toHaveProperty('outputCost')
      expect(m).toHaveProperty('totalCost')
      expect(m).toHaveProperty('totalCostFormatted')
    })
  })

  it('taskType parametresi olmadan çalışmalı (varsayılan genel)', () => {
    const req = { body: { tokenCount: 200 } }
    const res = makeRes()
    compareModels(req, res)
    const result = res.json.mock.calls[0][0]
    expect(result.taskType).toBe('genel')
  })

})

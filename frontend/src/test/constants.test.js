import { estimateTokens } from '../constants.jsx'

describe('estimateTokens', () => {
  it('boş string için 0 döndürmeli', () => {
    // Arrange — test verisi hazırlanıyor
    const metin = ''

    // Act — fonksiyon çalıştırılıyor
    const sonuc = estimateTokens(metin)

    // Assert — sonuç doğrulanıyor
    expect(sonuc).toBe(0)
  })

  it('4 karakterli metin için 1 döndürmeli', () => {
    // Arrange — 4 karakterlik bir metin hazırlanıyor
    const metin = 'test'

    // Act — fonksiyon çalıştırılıyor
    const sonuc = estimateTokens(metin)

    // Assert — 4 / 4 = 1 token bekleniyor
    expect(sonuc).toBe(1)
  })

  it('5 karakterli metin için 2 döndürmeli', () => {
    // Arrange — 5 karakterlik bir metin hazırlanıyor
    const metin = 'merhb'

    // Act — fonksiyon çalıştırılıyor
    const sonuc = estimateTokens(metin)

    // Assert — Math.ceil(5 / 4) = 2 token bekleniyor
    expect(sonuc).toBe(2)
  })
})

describe('estimateTokens — edge case testleri', () => {

  it('sadece boşluk içeren metin için doğru sonuç döndürmeli', () => {
    const sonuc = estimateTokens('   ')   // 3 boşluk = 3 karakter
    expect(sonuc).toBe(1)                // Math.ceil(3/4) = 1
  })

  it('Türkçe karakter içeren metni doğru saymali', () => {
    const sonuc = estimateTokens('şğüöı')  // 5 Türkçe karakter
    expect(sonuc).toBe(2)                 // Math.ceil(5/4) = 2
  })

  it('çok uzun metin için crash etmemeli', () => {
    const uzunMetin = 'a'.repeat(4000)  // 4000 karakter
    const sonuc = estimateTokens(uzunMetin)
    expect(sonuc).toBe(1000)           // 4000/4 = 1000
  })

})
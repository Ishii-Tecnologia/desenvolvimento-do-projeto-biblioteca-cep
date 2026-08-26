import { supabase } from '@/lib/supabase/client'

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputFormat?: 'image/jpeg' | 'image/webp' | 'image/png'
}

/**
 * Comprime uma imagem no frontend utilizando a Canvas API nativa.
 * Redimensiona proporcionalmente para não ultrapassar maxWidth/maxHeight e comprime para qualidade definida.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<{ blob: Blob; dataUrl: string }> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.8, outputFormat = 'image/jpeg' } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Arquivo de imagem inválido ou corrompido.'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Redimensionar proporcionalmente se exceder as dimensões máximas
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            maxHeight ? (height = maxHeight) : height
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto 2D do Canvas.'))
          return
        }

        // Fundo branco caso a imagem original tenha transparência e estejamos exportando para jpeg
        if (outputFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, height)
        }

        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL(outputFormat, quality)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao gerar blob da imagem comprimida.'))
              return
            }
            resolve({ blob, dataUrl })
          },
          outputFormat,
          quality,
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Faz o upload de um arquivo comprimido para um bucket do Supabase Storage e retorna a URL pública gerada.
 */
export async function uploadImageToStorage(
  file: File,
  bucket: 'avatars' | 'capas',
  options: CompressOptions = {},
): Promise<string> {
  const { blob } = await compressImage(file, options)
  const ext = options.outputFormat === 'image/webp' ? 'webp' : 'jpg'
  const randomSuffix = Math.random().toString(36).substring(2, 9)
  const timestamp = Date.now()
  const filePath = `${timestamp}_${randomSuffix}.${ext}`

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, blob, {
    contentType: options.outputFormat || 'image/jpeg',
    cacheControl: '3600',
    upsert: true,
  })

  if (error) {
    throw new Error(`Erro ao enviar imagem: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return publicUrl
}

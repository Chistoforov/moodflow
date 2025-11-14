interface FormattedAnalysisProps {
  text: string
}

export function FormattedAnalysis({ text }: FormattedAnalysisProps) {
  // Разбиваем текст на части: обычный текст и текст в **
  const parts = text.split(/(\*\*.*?\*\*)/)
  
  return (
    <div className="text-sm leading-relaxed">
      {parts.map((part, index) => {
        // Если часть обернута в **, делаем её жирной
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2)
          return (
            <strong key={index} className="font-semibold">
              {boldText}
            </strong>
          )
        }
        // Обычный текст - разбиваем на строки для сохранения переносов
        return part.split('\n').map((line, lineIndex) => (
          <span key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < part.split('\n').length - 1 && <br />}
          </span>
        ))
      })}
    </div>
  )
}


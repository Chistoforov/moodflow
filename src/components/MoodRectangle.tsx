import React from 'react';

// Вспомогательная функция для конвертации hex в rgb
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

interface MoodRectangleProps {
  score: number;
  selected?: boolean;
  variant?: 'calendar' | 'selector' | 'admin';
  className?: string;
  dateNumber?: number; // Номер даты для отображения внутри квадрата в календаре
}

const MOOD_CONFIG = {
  1: {
    label: 'Очень плохое',
    labelShort: 'Оч. плохое',
    bgColor: '#E63946', // Красновато-оранжевый (более темный)
    textColor: '#FFFFFF',
  },
  2: {
    label: 'Плохое',
    labelShort: 'Плохое',
    bgColor: '#FF8C42', // Оранжевый
    textColor: '#FFFFFF',
  },
  3: {
    label: 'Нейтральное',
    labelShort: 'Нейтр.',
    bgColor: '#6C757D', // Серый
    textColor: '#FFFFFF',
  },
  4: {
    label: 'Хорошее',
    labelShort: 'Хорошее',
    bgColor: '#90EE90', // Светло-зеленый
    textColor: '#FFFFFF',
  },
  5: {
    label: 'Отличное',
    labelShort: 'Отличное',
    bgColor: '#32CD32', // Ярко-зеленый (limegreen)
    textColor: '#FFFFFF',
  },
};

/**
 * Прямоугольный индикатор настроения с текстом
 * Используется в календаре, при выборе настроения и в админке
 */
export const MoodRectangle: React.FC<MoodRectangleProps> = ({ 
  score, 
  selected = false, 
  variant = 'calendar',
  className = '',
  dateNumber
}) => {
  const config = MOOD_CONFIG[score as keyof typeof MOOD_CONFIG];
  
  if (!config) {
    return null;
  }
  
  // Размеры в зависимости от варианта
  const sizeClasses = {
    calendar: 'w-full h-[36px] text-[7px] sm:text-[8px] px-0.5 py-1 leading-[1.1]',
    selector: 'min-w-[90px] h-10 text-xs px-3',
    admin: 'min-w-[120px] h-8 text-xs px-2',
  };

  // Для календаря: разрешаем перенос для длинных текстов
  const allowWrap = variant === 'calendar';

  const baseClasses = `
    rounded-lg
    flex flex-col items-center justify-center
    font-medium
    transition-all
    ${sizeClasses[variant]}
    ${selected ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''}
    ${variant === 'calendar' ? 'border border-white/20 shrink-0' : ''}
    ${className}
  `;

  // Эффект свечения для всех настроений в календаре
  const getGlowStyle = () => {
    if (variant === 'calendar') {
      // Для календаря добавляем легкое свечение для эффекта стекла
      const rgb = hexToRgb(config.bgColor);
      if (rgb) {
        return {
          boxShadow: `0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3), 0 0 4px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
        };
      }
    }
    
    if (selected) {
      const rgb = hexToRgb(config.bgColor);
      if (rgb) {
        return {
          boxShadow: `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
        };
      }
    }
    
    return {};
  };

  const glowStyle = getGlowStyle();

  // Для календаря: используем полный текст для всех настроений
  const displayLabel = config.label;

  // Полупрозрачный фон с эффектом стекла для календаря
  const getBackgroundStyle = () => {
    if (variant === 'calendar') {
      const rgb = hexToRgb(config.bgColor);
      if (rgb) {
        // Эффект цветного стекла - полупрозрачный фон с размытием
        return {
          backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        };
      }
    }
    return {
      backgroundColor: config.bgColor,
    };
  };

  const style = {
    ...getBackgroundStyle(),
    color: config.textColor,
    ...glowStyle,
  };

  return (
    <div
      className={baseClasses}
      style={style}
      title={config.label}
    >
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-0.5 px-0">
        {variant === 'calendar' && dateNumber !== undefined && (
          <div 
            className="text-[10px] sm:text-[11px] font-bold leading-none flex-shrink-0"
            style={{ color: config.textColor }}
          >
            {dateNumber}
          </div>
        )}
        <span 
          className={`${allowWrap ? 'text-center leading-tight' : 'whitespace-nowrap'} flex-1 flex items-center justify-center`}
          style={allowWrap ? { 
            wordBreak: 'break-word', 
            lineHeight: '1.15', 
            textAlign: 'center', 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: variant === 'calendar' ? '7px' : undefined,
            maxHeight: variant === 'calendar' ? '18px' : '100%'
          } : {}}
        >
          {displayLabel}
        </span>
      </div>
    </div>
  );
};

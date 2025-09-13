import React from 'react';
import type { Category } from './types';

const GiftIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3s-3 1.34-3 3c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V9c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-4 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM4 9h16v10H4V9z"/></svg> );

export const CATEGORIES: Category[] = [
  {
    id: 'new_year_gift_card',
    nameKey: 'category_new_year_gift_card_name',
    descriptionKey: 'category_new_year_gift_card_desc',
    icon: <GiftIcon />,
    fields: [
      { name: 'productImage', labelKey: 'field_personalPhoto_label', type: 'file', required: true, infoKey: 'field_personalPhoto_info' },
      { name: 'theme', labelKey: 'field_theme_label', type: 'select', optionKeys: ['option_theme_traditional', 'option_theme_modern', 'option_theme_playful', 'option_theme_elegant'], required: true, infoKey: 'field_theme_info' },
      { name: 'greetingText', labelKey: 'field_greetingText_label', type: 'textarea', placeholderKey: 'field_greetingText_placeholder', required: true },
    ],
    promptTemplate: (data) => {
      const themeInstructions: { [key: string]: string } = {
        'option_theme_traditional': 'Incorporate traditional New Year design elements such as lucky knots, cranes, pine trees, and elegant calligraphy. Use a classic color palette of red, gold, and white.',
        'option_theme_modern': 'Create a sleek, modern, and chic design. Use minimalist typography, geometric patterns, and a sophisticated color palette like navy, gold, and cream.',
        'option_theme_playful': 'Design a fun, cute, and playful card. Use cartoon-style illustrations, bright colors, and whimsical fonts. Maybe feature cute animals celebrating the New Year.',
        'option_theme_elegant': 'Produce an elegant and luxurious design. Use sophisticated elements like watercolor illustrations, script fonts, and a soft color palette with metallic accents.'
      };
      const theme = data.theme || 'option_theme_traditional';
      return `You are a professional gift card designer. Create a beautiful New Year's gift card using the provided elements.
      - **Primary Task:** Seamlessly integrate the uploaded personal photo into the gift card design. The photo is the centerpiece.
      - **Design Theme:** The overall theme is "${data.theme}". ${themeInstructions[theme]}
      - **Greeting Text:** Incorporate the following text beautifully into the design: "${data.greetingText}". Choose a font and placement that complements the theme.
      - **Final Output:** Generate a complete, high-resolution gift card image. The result should look like a professionally designed and printed card, ready to be shared. Do not just place text on the photo; create a full design around it. The output should be a single, cohesive image.`;
    },
  },
];
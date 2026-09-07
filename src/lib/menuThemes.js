// Single source of truth for per-menu flyer palettes.
// Used by BOTH the homepage "Choose your dinner style" cards and the /menu page
// price text + "Add to Order" buttons, so they can never drift out of sync.
export const MENU_THEMES = {
  family: {
    label: 'Family Dinners',
    solid: '#D9A5A0', // dusty pink
    tint: '#F3E7E4',
    text: 'text-[#D9A5A0]',
    bg: 'bg-[#D9A5A0]',
    btnText: 'text-charcoal',
    border: 'border-[#D9A5A0]',
    arrow: 'bg-[#C68F8A]', // slightly darker shade for the circular arrow button
  },
  'low-carb': {
    label: 'Low Carb Dinners',
    solid: '#F0B79A', // apricot-pink
    tint: '#FBE8DC',
    text: 'text-[#F0B79A]',
    bg: 'bg-[#F0B79A]',
    btnText: 'text-charcoal',
    border: 'border-[#F0B79A]',
    arrow: 'bg-[#E09D7E]',
  },
  kiddies: {
    label: 'Kiddies Dinners',
    solid: '#8FADA6', // green/blue teal
    tint: '#E4EFED',
    text: 'text-[#8FADA6]',
    bg: 'bg-[#8FADA6]',
    btnText: 'text-white',
    border: 'border-[#8FADA6]',
    arrow: 'bg-[#7A9A93]',
  },
};

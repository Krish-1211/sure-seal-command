export interface ProductVariant {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Product {
  handle: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  variants: ProductVariant[];
}

export const products: Product[] = [
  {
    "handle": "grout-tile-stone-cleaner-spray-wipe",
    "name": "Grout Tile & Stone Cleaner (Spray & Wipe)",
    "description": "Ready to use, fast acting stain remover. Safe for all surfaces (avoid unsealed polished stone). Great for everyday use.",
    "category": "Cleaners",
    "tags": [
      "retail"
    ],
    "image": "/images/cleaner_gts750u_front.png",
    "variants": [
      {
        "name": "750ML",
        "sku": "GTS750U",
        "price": 17.55,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-cleaner-spray-wipe-wholesale",
    "name": "Grout Tile & Stone Cleaner (Spray & Wipe) - Wholesale",
    "description": "Ready to use, fast acting stain remover. Safe for all surfaces (avoid unsealed polished stone). Great for everyday use.",
    "category": "Cleaners",
    "tags": [
      "wholesale"
    ],
    "image": "/images/cleaner_gts750u_front.png",
    "variants": [
      {
        "name": "750ML",
        "sku": "GTS750U-W",
        "price": 12.76,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-cleaner-concentrate",
    "name": "Grout Tile & Stone Cleaner Concentrate",
    "description": "Concentrated heavy duty cleaner. Cleans toughest stains. Great for dirt removal and cleaning concrete. Recommended for use on sealed surfaces.",
    "category": "Cleaners",
    "tags": [
      "retail"
    ],
    "image": "/images/cleaner_gts1u_group.png",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "GTS1U",
        "price": 20.95,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "GTS4U",
        "price": 76.95,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "GTS20D",
        "price": 326.75,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-cleaner-concentrate-wholesale",
    "name": "Grout Tile & Stone Cleaner Concentrate - Wholesale",
    "description": "Concentrated heavy duty cleaner. Cleans toughest stains. Great for dirt removal and cleaning concrete. Recommended for use on sealed surfaces.",
    "category": "Cleaners",
    "tags": [
      "wholesale"
    ],
    "image": "/images/cleaner_gts1u_group.png",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "GTS1U-W",
        "price": 15.24,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "GTS4U-W",
        "price": 55.96,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "GTS20D-W",
        "price": 237.64,
        "stock": 100
      }
    ]
  },
  {
    "handle": "eff-plus-remover",
    "name": "Eff-Plus Remover",
    "description": "Removes efflorescence, grout haze, cement, and rust stains.",
    "category": "Cleaners",
    "tags": [
      "retail"
    ],
    "image": "/images/cleaner_effp1u_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "EFFP1U",
        "price": 18.45,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "EFFP4U",
        "price": 56.65,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "EFFP20D",
        "price": 239.6,
        "stock": 100
      }
    ]
  },
  {
    "handle": "eff-plus-remover-wholesale",
    "name": "Eff-Plus Remover - Wholesale",
    "description": "Removes efflorescence, grout haze, cement, and rust stains.",
    "category": "Cleaners",
    "tags": [
      "wholesale"
    ],
    "image": "/images/cleaner_effp1u_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "EFFP1U-W",
        "price": 13.42,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "EFFP4U-W",
        "price": 41.2,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "EFFP20D-W",
        "price": 174.25,
        "stock": 100
      }
    ]
  },
  {
    "handle": "sure-clean-porcelain-paste-cleaner",
    "name": "Sure Clean Porcelain Paste Cleaner",
    "description": "Removes wax, grease, oil, and soap scum. Ideal for polished porcelain and natural stone.",
    "category": "Cleaners",
    "tags": [
      "retail"
    ],
    "image": "/images/cleaner_sc1u_group.png",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "SC1U",
        "price": 30.5,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "SC4U",
        "price": 109.5,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "SC20D",
        "price": 375.9,
        "stock": 100
      }
    ]
  },
  {
    "handle": "sure-clean-porcelain-paste-cleaner-wholesale",
    "name": "Sure Clean Porcelain Paste Cleaner - Wholesale",
    "description": "Removes wax, grease, oil, and soap scum. Ideal for polished porcelain and natural stone.",
    "category": "Cleaners",
    "tags": [
      "wholesale"
    ],
    "image": "/images/cleaner_sc1u_group.png",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "SC1U-W",
        "price": 22.18,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "SC4U-W",
        "price": 79.64,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "SC20D-W",
        "price": 273.38,
        "stock": 100
      }
    ]
  },
  {
    "handle": "rug-carpet-textile-stain-remover",
    "name": "Rug Carpet & Textile Stain Remover",
    "description": "Fast acting stain remover. Safe & easy to use. For rugs, carpet, car mats & more.",
    "category": "Cleaners",
    "tags": [
      "retail"
    ],
    "image": "/images/cleaner_rcsr750u_front.png",
    "variants": [
      {
        "name": "750ML",
        "sku": "RCSR750U",
        "price": 17.75,
        "stock": 100
      }
    ]
  },
  {
    "handle": "rug-carpet-textile-stain-remover-wholesale",
    "name": "Rug Carpet & Textile Stain Remover - Wholesale",
    "description": "Fast acting stain remover. Safe & easy to use. For rugs, carpet, car mats & more.",
    "category": "Cleaners",
    "tags": [
      "wholesale"
    ],
    "image": "/images/cleaner_rcsr750u_front.png",
    "variants": [
      {
        "name": "750ML",
        "sku": "RCSR750U-W",
        "price": 12.91,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-sealer-quick-drying-aerosol",
    "name": "Grout Tile & Stone Sealer (Quick Drying Aerosol)",
    "description": "World's First Aerosol Sealer. Used and recommended by many tilers & contractors. Long lasting stain protection. Resists water and oil based stains. Helps prevent mould & mildew.",
    "category": "Aerosols",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_gts300a_front.png",
    "variants": [
      {
        "name": "300g",
        "sku": "QDAU",
        "price": 34.95,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-sealer-quick-drying-aerosol-wholesale",
    "name": "Grout Tile & Stone Sealer (Quick Drying Aerosol) - Wholesale",
    "description": "World's First Aerosol Sealer. Used and recommended by many tilers & contractors. Long lasting stain protection. Resists water and oil based stains. Helps prevent mould & mildew.",
    "category": "Aerosols",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_gts300a_front.png",
    "variants": [
      {
        "name": "300g",
        "sku": "QDAU-W",
        "price": 25.42,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-sealer-slow-drying-aerosol",
    "name": "Grout Tile & Stone Sealer (Slow Drying Aerosol)",
    "description": "Ideal for stone bench tops. Deep penetrating sealer. Long lasting stain protection. Resists water and oil based stains. Helps prevent mould & mildew.",
    "category": "Aerosols",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_sdau_front.png",
    "variants": [
      {
        "name": "300g",
        "sku": "SDAU",
        "price": 35.95,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-sealer-slow-drying-aerosol-wholesale",
    "name": "Grout Tile & Stone Sealer (Slow Drying Aerosol) - Wholesale",
    "description": "Ideal for stone bench tops. Deep penetrating sealer. Long lasting stain protection. Resists water and oil based stains. Helps prevent mould & mildew.",
    "category": "Aerosols",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_sdau_front.png",
    "variants": [
      {
        "name": "300g",
        "sku": "SDAU-W",
        "price": 26.15,
        "stock": 100
      }
    ]
  },
  {
    "handle": "rug-carpet-protector",
    "name": "Rug & Carpet Protector",
    "description": "Protects from oil and water-based stains. Will not affect dyes or cause shrinkage. Suitable for Oriental & Persian rugs & carpet, lounge suites & car upholstery.",
    "category": "Aerosols",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_rcpau_front.png",
    "variants": [
      {
        "name": "350g",
        "sku": "RCPAU",
        "price": 29.5,
        "stock": 100
      }
    ]
  },
  {
    "handle": "rug-carpet-protector-wholesale",
    "name": "Rug & Carpet Protector - Wholesale",
    "description": "Protects from oil and water-based stains. Will not affect dyes or cause shrinkage. Suitable for Oriental & Persian rugs & carpet, lounge suites & car upholstery.",
    "category": "Aerosols",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_rcpau_front.png",
    "variants": [
      {
        "name": "350g",
        "sku": "RCPAU-W",
        "price": 21.45,
        "stock": 100
      }
    ]
  },
  {
    "handle": "timber-sealer-aerosol",
    "name": "Timber Sealer (Aerosol)",
    "description": "Preserves & Extends. Quick drying & easy to apply. Suitable for raw & stained timber. Oil & stain resistant.",
    "category": "Aerosols",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_tsau_front.png",
    "variants": [
      {
        "name": "300g",
        "sku": "TSAU",
        "price": 35.25,
        "stock": 100
      }
    ]
  },
  {
    "handle": "timber-sealer-aerosol-wholesale",
    "name": "Timber Sealer (Aerosol) - Wholesale",
    "description": "Preserves & Extends. Quick drying & easy to apply. Suitable for raw & stained timber. Oil & stain resistant.",
    "category": "Aerosols",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_tsau_front.png",
    "variants": [
      {
        "name": "300g",
        "sku": "TSAU-W",
        "price": 25.64,
        "stock": 100
      }
    ]
  },
  {
    "handle": "ezy-as-1-2-3-water-based-sealer",
    "name": "Ezy As 1-2-3 Water-Based Sealer",
    "description": "Create your own finish: Low sheen, semi-gloss or full gloss. Gloss up walls eg. natural stack stone walls. Will maintain a tough, durable finish that resists abrasion.",
    "category": "Sealers",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_ezyas1l_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "EA1U",
        "price": 35.2,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "EA4U",
        "price": 105.6,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "EA20D",
        "price": 324.5,
        "stock": 100
      }
    ]
  },
  {
    "handle": "ezy-as-1-2-3-water-based-sealer-wholesale",
    "name": "Ezy As 1-2-3 Water-Based Sealer - Wholesale",
    "description": "Create your own finish: Low sheen, semi-gloss or full gloss. Gloss up walls eg. natural stack stone walls. Will maintain a tough, durable finish that resists abrasion.",
    "category": "Sealers",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_ezyas1l_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "EA1U-W",
        "price": 25.6,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "EA4U-W",
        "price": 76.8,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "EA20D-W",
        "price": 236,
        "stock": 100
      }
    ]
  },
  {
    "handle": "consolidator-sealer-water-based",
    "name": "Consolidator Sealer Water-Based",
    "description": "Ideal around salt-water swimming pools. Hardens loose & friable surfaces. Helps prevent saltwater erosion. Binds stone.",
    "category": "Sealers",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_sd1u_wb_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "CONS1U",
        "price": 70.5,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "CONS4U",
        "price": 237.6,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "CONS20D",
        "price": 979,
        "stock": 100
      }
    ]
  },
  {
    "handle": "consolidator-sealer-water-based-wholesale",
    "name": "Consolidator Sealer Water-Based - Wholesale",
    "description": "Ideal around salt-water swimming pools. Hardens loose & friable surfaces. Helps prevent saltwater erosion. Binds stone.",
    "category": "Sealers",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_sd1u_wb_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "CONS1U-W",
        "price": 51.27,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "CONS4U-W",
        "price": 172.8,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "CONS20D-W",
        "price": 712,
        "stock": 100
      }
    ]
  },
  {
    "handle": "timber-sealer-solvent",
    "name": "Timber Sealer (Solvent)",
    "description": "Preserves & Protects. Suitable for raw & stained timber. Protects against water & oil staining. Invisible protection.",
    "category": "Sealers",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_24p1u_s_front.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "TS1U",
        "price": 57.25,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "TS4U",
        "price": 176,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "TS20D",
        "price": 748,
        "stock": 100
      }
    ]
  },
  {
    "handle": "timber-sealer-solvent-wholesale",
    "name": "Timber Sealer (Solvent) - Wholesale",
    "description": "Preserves & Protects. Suitable for raw & stained timber. Protects against water & oil staining. Invisible protection.",
    "category": "Sealers",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_24p1u_s_front.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "TS1U-W",
        "price": 41.64,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "TS4U-W",
        "price": 128,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "TS20D-W",
        "price": 544,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-sealer-quick-drying-solvent",
    "name": "Grout Tile & Stone Sealer (Quick Drying Solvent)",
    "description": "Superior protection for porous surfaces. Works great for terracotta. Protects from mould and thaw damage. Ideal for low temperature application.",
    "category": "Sealers",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_qd1u_s_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "QD1U",
        "price": 57.95,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "QD4U",
        "price": 176.5,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "QD20D",
        "price": 751.95,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-sealer-quick-drying-solvent-wholesale",
    "name": "Grout Tile & Stone Sealer (Quick Drying Solvent) - Wholesale",
    "description": "Superior protection for porous surfaces. Works great for terracotta. Protects from mould and thaw damage. Ideal for low temperature application.",
    "category": "Sealers",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_qd1u_s_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "QD1U-W",
        "price": 42.15,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "QD4U-W",
        "price": 128.36,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "QD20D-W",
        "price": 546.87,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-sealer-slow-drying-solvent",
    "name": "Grout Tile & Stone Sealer (Slow Drying Solvent)",
    "description": "Durable stain resistant protection for dense surfaces. Best for Marble & Granite application. Slower drying for greater penetration. Helps prevent mould and mildew.",
    "category": "Sealers",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_sd1u_s_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "SD1U",
        "price": 70.95,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "SD4U",
        "price": 213.15,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "SD20D",
        "price": 882,
        "stock": 100
      }
    ]
  },
  {
    "handle": "grout-tile-stone-sealer-slow-drying-solvent-wholesale",
    "name": "Grout Tile & Stone Sealer (Slow Drying Solvent) - Wholesale",
    "description": "Durable stain resistant protection for dense surfaces. Best for Marble & Granite application. Slower drying for greater penetration. Helps prevent mould and mildew.",
    "category": "Sealers",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_sd1u_s_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "SD1U-W",
        "price": 51.6,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "SD4U-W",
        "price": 155.02,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "SD20D-W",
        "price": 641.45,
        "stock": 100
      }
    ]
  },
  {
    "handle": "24-7-plus-stone-concrete-sealer",
    "name": "24/7 Plus Stone & Concrete Sealer",
    "description": "Water-based. Excellent for garden walls, retaining walls, decorative concrete and benches. Life for up to 10 years. Allows the treated surface to breathe.",
    "category": "Sealers",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_24p1u_wb_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "24P1U",
        "price": 52.5,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "24P4U",
        "price": 170,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "24P20D",
        "price": 845.5,
        "stock": 100
      }
    ]
  },
  {
    "handle": "24-7-plus-stone-concrete-sealer-wholesale",
    "name": "24/7 Plus Stone & Concrete Sealer - Wholesale",
    "description": "Water-based. Excellent for garden walls, retaining walls, decorative concrete and benches. Life for up to 10 years. Allows the treated surface to breathe.",
    "category": "Sealers",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_24p1u_wb_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "24P1U-W",
        "price": 38.18,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "24P4U-W",
        "price": 123.64,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "24P20D-W",
        "price": 614.91,
        "stock": 100
      }
    ]
  },
  {
    "handle": "premium-plus-sealer",
    "name": "Premium Plus Sealer",
    "description": "Gold Standard Sealer. Water-based, heavy duty penetrating sealer for commercial application. Promotes easier clean up. Long life sealer for up to 15 years. Ideal for high-traffic areas.",
    "category": "Sealers",
    "tags": [
      "retail"
    ],
    "image": "/images/sealer_pp1u_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "PP1U",
        "price": 73.5,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "PP4U",
        "price": 239.5,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "PP20D",
        "price": 1065.75,
        "stock": 100
      }
    ]
  },
  {
    "handle": "premium-plus-sealer-wholesale",
    "name": "Premium Plus Sealer - Wholesale",
    "description": "Gold Standard Sealer. Water-based, heavy duty penetrating sealer for commercial application. Promotes easier clean up. Long life sealer for up to 15 years. Ideal for high-traffic areas.",
    "category": "Sealers",
    "tags": [
      "wholesale"
    ],
    "image": "/images/sealer_pp1u_group.jpg",
    "variants": [
      {
        "name": "1 LTR",
        "sku": "PP1U-W",
        "price": 53.45,
        "stock": 100
      },
      {
        "name": "4 LTR",
        "sku": "PP4U-W",
        "price": 174.18,
        "stock": 100
      },
      {
        "name": "20 LTR",
        "sku": "PP20D-W",
        "price": 775.09,
        "stock": 100
      }
    ]
  }
];

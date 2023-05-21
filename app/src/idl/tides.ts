export type Tides = {
  "version": "0.1.0",
  "name": "tides",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "insuranceVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "userCreate",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPositions",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userHistory",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "userDeposit",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "userWithdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketAdd",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callMarketFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "putMarketFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "initialMarkPrice",
          "type": "u64"
        },
        {
          "name": "initialMarkVolatility",
          "type": "u64"
        },
        {
          "name": "symbolQuote",
          "type": "string"
        },
        {
          "name": "symbolBase",
          "type": "string"
        }
      ]
    },
    {
      "name": "marketPause",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketClose",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callMarketFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "putMarketFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketResume",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "exchangePause",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "exchangeResume",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "marketsDestroy",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "marketSideDeposit",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "depositAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketSideWithdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "collateralVaultPositionOpen",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "depositAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "collateralVaultPositionClose",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "insuranceWithdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "treasuryWithdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "globalCollateralWithdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "positionChange",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPositions",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userHistory",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marketCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "quoteAmount",
          "type": "i64"
        },
        {
          "name": "baseAmount",
          "type": "u64"
        },
        {
          "name": "slippageTolerance",
          "type": "u64"
        },
        {
          "name": "closePosition",
          "type": "bool"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "positionAddCollateral",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPositions",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "collateralAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "positionDelever",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "positionLiquidate",
      "accounts": [
        {
          "name": "liquidatooor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "liquidatooorPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPositions",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userHistory",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marketCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "quoteAmount",
          "type": "i64"
        },
        {
          "name": "baseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketStatsUpdate",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "exchangePaused",
            "type": "bool"
          },
          {
            "name": "fundingPaused",
            "type": "bool"
          },
          {
            "name": "collateralMint",
            "type": "publicKey"
          },
          {
            "name": "collateralVault",
            "type": "publicKey"
          },
          {
            "name": "collateralVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "collateralVaultNonce",
            "type": "u8"
          },
          {
            "name": "depositHistory",
            "type": "publicKey"
          },
          {
            "name": "tradeHistory",
            "type": "publicKey"
          },
          {
            "name": "fundingPaymentHistory",
            "type": "publicKey"
          },
          {
            "name": "fundingRateHistory",
            "type": "publicKey"
          },
          {
            "name": "liquidationHistory",
            "type": "publicKey"
          },
          {
            "name": "insuranceVault",
            "type": "publicKey"
          },
          {
            "name": "insuranceVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "insuranceVaultNonce",
            "type": "u8"
          },
          {
            "name": "treasuryVault",
            "type": "publicKey"
          },
          {
            "name": "treasuryVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "treasuryVaultNonce",
            "type": "u8"
          },
          {
            "name": "markets",
            "type": "publicKey"
          },
          {
            "name": "padding0",
            "type": "u64"
          },
          {
            "name": "padding1",
            "type": "u64"
          },
          {
            "name": "padding2",
            "type": "u64"
          },
          {
            "name": "padding3",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "markets",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "markets",
            "type": {
              "array": [
                {
                  "defined": "Market"
                },
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "fundingData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketIndex",
            "type": "u16"
          },
          {
            "name": "side",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "lastIncrementTs",
            "type": "u64"
          },
          {
            "name": "fundingRecordsTier0",
            "type": {
              "defined": "FundingRecordsTier"
            }
          },
          {
            "name": "fundingRecordsTier1",
            "type": {
              "defined": "FundingRecordsTier"
            }
          },
          {
            "name": "fundingRecordsTier2",
            "type": {
              "defined": "FundingRecordsTier"
            }
          }
        ]
      }
    },
    {
      "name": "collateralVaultPosition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": "publicKey"
          },
          {
            "name": "markets",
            "type": "publicKey"
          },
          {
            "name": "marketIndex",
            "type": "u16"
          },
          {
            "name": "side",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "collateralMint",
            "type": "publicKey"
          },
          {
            "name": "collateralVault",
            "type": "publicKey"
          },
          {
            "name": "depositAmount",
            "type": "u64"
          },
          {
            "name": "depositTimestamp",
            "type": "u64"
          },
          {
            "name": "cumulativeFeesPerDepositorCollateralAtDeposit",
            "type": "u64"
          },
          {
            "name": "cumulativeTradingDifferencePerDepositorCollateralAtDeposit",
            "type": "i64"
          },
          {
            "name": "padding0",
            "type": "publicKey"
          },
          {
            "name": "padding1",
            "type": "publicKey"
          },
          {
            "name": "padding2",
            "type": "u64"
          },
          {
            "name": "padding3",
            "type": "u64"
          },
          {
            "name": "padding4",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "cumulativeDeposits",
            "type": "u64"
          },
          {
            "name": "cumulativeWithdrawals",
            "type": "u64"
          },
          {
            "name": "collateral",
            "type": "i64"
          },
          {
            "name": "positions",
            "type": "publicKey"
          },
          {
            "name": "history",
            "type": "publicKey"
          },
          {
            "name": "padding0",
            "type": "publicKey"
          },
          {
            "name": "padding1",
            "type": "publicKey"
          },
          {
            "name": "padding2",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "userPositions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "positions",
            "type": {
              "array": [
                {
                  "defined": "Position"
                },
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "userHistory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "records",
            "type": {
              "array": [
                {
                  "defined": "OrderRecord"
                },
                100
              ]
            }
          },
          {
            "name": "head",
            "type": "u64"
          },
          {
            "name": "tail",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "index",
            "type": "u16"
          },
          {
            "name": "marketPaused",
            "type": "bool"
          },
          {
            "name": "mintQuote",
            "type": "publicKey"
          },
          {
            "name": "mintBase",
            "type": "publicKey"
          },
          {
            "name": "oraclePriceFeed",
            "type": "publicKey"
          },
          {
            "name": "oraclePrice",
            "type": "u64"
          },
          {
            "name": "oraclePriceTs",
            "type": "u64"
          },
          {
            "name": "emaNumeratorSum",
            "type": "u128"
          },
          {
            "name": "emaDenominatorSum",
            "type": "u128"
          },
          {
            "name": "emaTs",
            "type": "u64"
          },
          {
            "name": "callMarketData",
            "type": {
              "defined": "MarketSideData"
            }
          },
          {
            "name": "putMarketData",
            "type": {
              "defined": "MarketSideData"
            }
          },
          {
            "name": "fundingInterval",
            "type": "u64"
          },
          {
            "name": "collateralRatioTarget",
            "type": "u64"
          },
          {
            "name": "collateralRatioMax",
            "type": "u64"
          },
          {
            "name": "collateralRatioDelever",
            "type": "u64"
          },
          {
            "name": "minimumBaseAssetTradeSize",
            "type": "u64"
          },
          {
            "name": "collateralMint",
            "type": "publicKey"
          },
          {
            "name": "collateralDecimals",
            "type": "u32"
          },
          {
            "name": "symbolQuote",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "symbolBase",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "padding0",
            "type": "i64"
          },
          {
            "name": "padding1",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "MarketSideData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "side",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "collateralVault",
            "type": "publicKey"
          },
          {
            "name": "collateralVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "collateralVaultNonce",
            "type": "u8"
          },
          {
            "name": "markPrice",
            "type": "u64"
          },
          {
            "name": "markPriceTs",
            "type": "u64"
          },
          {
            "name": "quoteAssetAmountLong",
            "type": "i64"
          },
          {
            "name": "quoteAssetAmountShort",
            "type": "i64"
          },
          {
            "name": "quoteAssetAmountNet",
            "type": "i64"
          },
          {
            "name": "fundingRate",
            "type": "i64"
          },
          {
            "name": "fundingRateTs",
            "type": "u64"
          },
          {
            "name": "fundingData",
            "type": "publicKey"
          },
          {
            "name": "markVolatility",
            "type": "u64"
          },
          {
            "name": "currentDepositorCollateral",
            "type": "u64"
          },
          {
            "name": "cumulativeFeesPerDepositorCollateral",
            "type": "u64"
          },
          {
            "name": "cumulativeTradingDifferencePerDepositorCollateral",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "FundingRecordsTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "head",
            "type": "u64"
          },
          {
            "name": "tail",
            "type": "u64"
          },
          {
            "name": "intervalSec",
            "type": "u64"
          },
          {
            "name": "fundingRecords",
            "type": {
              "array": [
                {
                  "defined": "FundingRecord"
                },
                100
              ]
            }
          }
        ]
      }
    },
    {
      "name": "FundingRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "u64"
          },
          {
            "name": "endTs",
            "type": "u64"
          },
          {
            "name": "fundingRate",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "Position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "positionIndex",
            "type": "u16"
          },
          {
            "name": "marketIndex",
            "type": "u16"
          },
          {
            "name": "side",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "quoteAssetAmount",
            "type": "i64"
          },
          {
            "name": "totalCollateralDeposits",
            "type": "i64"
          },
          {
            "name": "additionalCollateralDeposits",
            "type": "i64"
          },
          {
            "name": "lastCumulativeFunding",
            "type": "i64"
          },
          {
            "name": "lastFundingTs",
            "type": "u64"
          },
          {
            "name": "padding0",
            "type": "u64"
          },
          {
            "name": "padding1",
            "type": "u64"
          },
          {
            "name": "padding2",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "OrderRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketIndex",
            "type": "u16"
          },
          {
            "name": "optionSide",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "orderSide",
            "type": {
              "defined": "OrderSide"
            }
          },
          {
            "name": "positionChangeDirection",
            "type": {
              "defined": "PositionChangeDirection"
            }
          },
          {
            "name": "quoteAmount",
            "type": "i64"
          },
          {
            "name": "baseAmount",
            "type": "u64"
          },
          {
            "name": "collateralDeposits",
            "type": "i64"
          },
          {
            "name": "collateralReturned",
            "type": "i64"
          },
          {
            "name": "cumulativeFunding",
            "type": "i64"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "ts",
            "type": "u64"
          },
          {
            "name": "padding0",
            "type": "u64"
          },
          {
            "name": "padding1",
            "type": "u64"
          },
          {
            "name": "padding2",
            "type": "i64"
          },
          {
            "name": "padding3",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "OptionSide",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Call"
          },
          {
            "name": "Put"
          }
        ]
      }
    },
    {
      "name": "OrderSide",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Long"
          },
          {
            "name": "Short"
          }
        ]
      }
    },
    {
      "name": "PositionChangeDirection",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Increase"
          },
          {
            "name": "Decrease"
          }
        ]
      }
    },
    {
      "name": "ExposureStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Delever"
          },
          {
            "name": "AboveMax"
          },
          {
            "name": "AboveTarget"
          },
          {
            "name": "BelowTarget"
          }
        ]
      }
    },
    {
      "name": "ExposureDirection",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Increase"
          },
          {
            "name": "Decrease"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NonZeroCollateralAfterClose",
      "msg": "Non-zero collateral after position close"
    },
    {
      "code": 6001,
      "name": "CrossPositionChange",
      "msg": "Cross position change"
    },
    {
      "code": 6002,
      "name": "MarketExposureAboveMax",
      "msg": "Market exposure is above max and this trade does not reduce exposure"
    },
    {
      "code": 6003,
      "name": "InvalidOraclePriceFeed",
      "msg": "Invalid oracle price feed"
    },
    {
      "code": 6004,
      "name": "InvalidCollateralAccountForMarket",
      "msg": "Invalid collateral account for given market"
    },
    {
      "code": 6005,
      "name": "InvalidFundingRateAccountForMarketData",
      "msg": "Invalid funding rate account for given market"
    },
    {
      "code": 6006,
      "name": "InvalidCollateralAccountAuthorityForMarket",
      "msg": "Invalid collateral account authority for given market"
    },
    {
      "code": 6007,
      "name": "InvalidCollateralAccountAuthority",
      "msg": "Tides is not the collateral account owner"
    },
    {
      "code": 6008,
      "name": "InvalidTreasuryAccountAuthority",
      "msg": "Tides is not the insurance account owner"
    },
    {
      "code": 6009,
      "name": "InvalidInsuranceAccountAuthority",
      "msg": "Tides is not the treasury account owner"
    },
    {
      "code": 6010,
      "name": "InsufficientDeposit",
      "msg": "Insufficient deposit"
    },
    {
      "code": 6011,
      "name": "InsufficientCollateral",
      "msg": "Insufficient collateral"
    },
    {
      "code": 6012,
      "name": "OrderTooLargeForVaultCollateral",
      "msg": "Order too large for vault collateral"
    },
    {
      "code": 6013,
      "name": "SufficientCollateral",
      "msg": "Sufficient collateral"
    },
    {
      "code": 6014,
      "name": "MaxNumberOfPositions",
      "msg": "Max number of positions taken"
    },
    {
      "code": 6015,
      "name": "PositionNotFound",
      "msg": "Position with these parameters not found"
    },
    {
      "code": 6016,
      "name": "AdminControlsPricesDisabled",
      "msg": "Admin Controls Prices Disabled"
    },
    {
      "code": 6017,
      "name": "MarketIndexNotInitialized",
      "msg": "Market Index Not Initialized"
    },
    {
      "code": 6018,
      "name": "MarketIndexAlreadyInitialized",
      "msg": "Market Index Already Initialized"
    },
    {
      "code": 6019,
      "name": "UserAccountAndUserPositionsAccountMismatch",
      "msg": "User Account And User Positions Account Mismatch"
    },
    {
      "code": 6020,
      "name": "UserHasNoPositionInMarket",
      "msg": "User Has No Position In Market"
    },
    {
      "code": 6021,
      "name": "InvalidInitialPeg",
      "msg": "Invalid Initial Peg"
    },
    {
      "code": 6022,
      "name": "InvalidRepegRedundant",
      "msg": "AMM repeg already configured with amt given"
    },
    {
      "code": 6023,
      "name": "InvalidRepegDirection",
      "msg": "AMM repeg incorrect repeg direction"
    },
    {
      "code": 6024,
      "name": "InvalidRepegProfitability",
      "msg": "AMM repeg out of bounds pnl"
    },
    {
      "code": 6025,
      "name": "SlippageOutsideLimit",
      "msg": "Slippage Outside Limit Price"
    },
    {
      "code": 6026,
      "name": "NegativeAssetCalculation",
      "msg": "Negative asset calculation"
    },
    {
      "code": 6027,
      "name": "TradeSizeTooSmall",
      "msg": "Trade Size Too Small"
    },
    {
      "code": 6028,
      "name": "TradeSizeZero",
      "msg": "Quote Size Cannot Be Zero"
    },
    {
      "code": 6029,
      "name": "InvalidUpdateK",
      "msg": "Price change too large when updating K"
    },
    {
      "code": 6030,
      "name": "AdminWithdrawTooLarge",
      "msg": "Admin tried to withdraw amount larger than fees collected"
    },
    {
      "code": 6031,
      "name": "MathError",
      "msg": "Math Error"
    },
    {
      "code": 6032,
      "name": "BnConversionError",
      "msg": "Conversion to u128/u64 failed with an overflow or underflow"
    },
    {
      "code": 6033,
      "name": "ClockUnavailable",
      "msg": "Clock unavailable"
    },
    {
      "code": 6034,
      "name": "UnableToLoadOracle",
      "msg": "Unable To Load Oracles"
    },
    {
      "code": 6035,
      "name": "OracleMarkSpreadLimit",
      "msg": "Oracle/Mark Spread Too Large"
    },
    {
      "code": 6036,
      "name": "HistoryAlreadyInitialized",
      "msg": "Tides history already initialized"
    },
    {
      "code": 6037,
      "name": "PositionAlreadyInitialized",
      "msg": "Position already initialized"
    },
    {
      "code": 6038,
      "name": "MarketPaused",
      "msg": "Market is paused"
    },
    {
      "code": 6039,
      "name": "MarketNotPaused",
      "msg": "Market is not paused"
    },
    {
      "code": 6040,
      "name": "PositionsNotClosed",
      "msg": "Positions must all be closed to close the market"
    },
    {
      "code": 6041,
      "name": "MarketStillInitialized",
      "msg": "Market is still initialized"
    },
    {
      "code": 6042,
      "name": "ExchangePaused",
      "msg": "Exchange is paused"
    },
    {
      "code": 6043,
      "name": "InvalidWhitelistToken",
      "msg": "Invalid whitelist token"
    },
    {
      "code": 6044,
      "name": "WhitelistTokenNotFound",
      "msg": "Whitelist token not found"
    },
    {
      "code": 6045,
      "name": "InvalidDiscountToken",
      "msg": "Invalid discount token"
    },
    {
      "code": 6046,
      "name": "DiscountTokenNotFound",
      "msg": "Discount token not found"
    },
    {
      "code": 6047,
      "name": "InvalidReferrer",
      "msg": "Invalid referrer"
    },
    {
      "code": 6048,
      "name": "ReferrerNotFound",
      "msg": "Referrer not found"
    },
    {
      "code": 6049,
      "name": "InvalidOracle",
      "msg": "InvalidOracle"
    },
    {
      "code": 6050,
      "name": "OracleNotFound",
      "msg": "OracleNotFound"
    },
    {
      "code": 6051,
      "name": "LiquidationsBlockedByOracle",
      "msg": "Liquidations Blocked By Oracle"
    },
    {
      "code": 6052,
      "name": "UserMaxDeposit",
      "msg": "Can not deposit more than max deposit"
    },
    {
      "code": 6053,
      "name": "CantDeleteUserWithCollateral",
      "msg": "Can not delete user that still has collateral"
    },
    {
      "code": 6054,
      "name": "InvalidFundingProfitability",
      "msg": "AMM funding out of bounds pnl"
    },
    {
      "code": 6055,
      "name": "CastingFailure",
      "msg": "Casting Failure"
    },
    {
      "code": 6056,
      "name": "InvalidOrder",
      "msg": "Invalid Order"
    },
    {
      "code": 6057,
      "name": "UserHasNoOrder",
      "msg": "User has no order"
    },
    {
      "code": 6058,
      "name": "OrderAmountTooSmall",
      "msg": "Order Amount Too Small"
    },
    {
      "code": 6059,
      "name": "MaxNumberOfOrders",
      "msg": "Max number of orders taken"
    },
    {
      "code": 6060,
      "name": "OrderDoesNotExist",
      "msg": "Order does not exist"
    },
    {
      "code": 6061,
      "name": "OrderNotOpen",
      "msg": "Order not open"
    },
    {
      "code": 6062,
      "name": "CouldNotFillOrder",
      "msg": "CouldNotFillOrder"
    },
    {
      "code": 6063,
      "name": "ReduceOnlyOrderIncreasedRisk",
      "msg": "Reduce only order increased risk"
    },
    {
      "code": 6064,
      "name": "OrderStateAlreadyInitialized",
      "msg": "Order state already initialized"
    },
    {
      "code": 6065,
      "name": "UnableToLoadAccountLoader",
      "msg": "Unable to load AccountLoader"
    },
    {
      "code": 6066,
      "name": "TradeSizeTooLarge",
      "msg": "Trade Size Too Large"
    },
    {
      "code": 6067,
      "name": "UnableToWriteToRemainingAccount",
      "msg": "Unable to write to remaining account"
    },
    {
      "code": 6068,
      "name": "UserCantReferThemselves",
      "msg": "User cant refer themselves"
    },
    {
      "code": 6069,
      "name": "DidNotReceiveExpectedReferrer",
      "msg": "Did not receive expected referrer"
    },
    {
      "code": 6070,
      "name": "CouldNotDeserializeReferrer",
      "msg": "Could not deserialize referrer"
    },
    {
      "code": 6071,
      "name": "MarketOrderMustBeInPlaceAndFill",
      "msg": "Market order must be in place and fill"
    },
    {
      "code": 6072,
      "name": "UserOrderIdAlreadyInUse",
      "msg": "User Order Id Already In Use"
    },
    {
      "code": 6073,
      "name": "PositionCannotBeLiquidated",
      "msg": "Position cannot be liquidated"
    },
    {
      "code": 6074,
      "name": "InvalidMarginRatio",
      "msg": "Invalid Margin Ratio"
    },
    {
      "code": 6075,
      "name": "CantCancelPostOnlyOrder",
      "msg": "Cant Cancel Post Only Order"
    },
    {
      "code": 6076,
      "name": "InvalidOracleOffset",
      "msg": "InvalidOracleOffset"
    },
    {
      "code": 6077,
      "name": "CantExpireOrders",
      "msg": "CantExpireOrders"
    },
    {
      "code": 6078,
      "name": "UserMustForgoSettlement",
      "msg": "UserMustForgoSettlement"
    },
    {
      "code": 6079,
      "name": "NoAvailableCollateralToBeClaimed",
      "msg": "NoAvailableCollateralToBeClaimed"
    },
    {
      "code": 6080,
      "name": "SettlementNotEnabled",
      "msg": "SettlementNotEnabled"
    },
    {
      "code": 6081,
      "name": "MustCallSettlePositionFirst",
      "msg": "MustCallSettlePositionFirst"
    }
  ]
};

export const IDL: Tides = {
  "version": "0.1.0",
  "name": "tides",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "insuranceVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "userCreate",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPositions",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userHistory",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "userDeposit",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "userWithdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketAdd",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callMarketFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "putMarketFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "initialMarkPrice",
          "type": "u64"
        },
        {
          "name": "initialMarkVolatility",
          "type": "u64"
        },
        {
          "name": "symbolQuote",
          "type": "string"
        },
        {
          "name": "symbolBase",
          "type": "string"
        }
      ]
    },
    {
      "name": "marketPause",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketClose",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callMarketFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "putMarketFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketResume",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "exchangePause",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "exchangeResume",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "marketsDestroy",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "marketSideDeposit",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "depositAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketSideWithdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "collateralVaultPositionOpen",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "depositAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "collateralVaultPositionClose",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "callCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "putCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "insuranceWithdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "treasuryWithdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "globalCollateralWithdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "positionChange",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPositions",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userHistory",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marketCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "quoteAmount",
          "type": "i64"
        },
        {
          "name": "baseAmount",
          "type": "u64"
        },
        {
          "name": "slippageTolerance",
          "type": "u64"
        },
        {
          "name": "closePosition",
          "type": "bool"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "positionAddCollateral",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPositions",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "collateralAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "positionDelever",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "positionLiquidate",
      "accounts": [
        {
          "name": "liquidatooor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "liquidatooorPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPositions",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userHistory",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketCollateralVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "insuranceVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marketCollateralVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        },
        {
          "name": "optionSide",
          "type": {
            "defined": "OptionSide"
          }
        },
        {
          "name": "quoteAmount",
          "type": "i64"
        },
        {
          "name": "baseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketStatsUpdate",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "markets",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "putFundingData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketIndex",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "exchangePaused",
            "type": "bool"
          },
          {
            "name": "fundingPaused",
            "type": "bool"
          },
          {
            "name": "collateralMint",
            "type": "publicKey"
          },
          {
            "name": "collateralVault",
            "type": "publicKey"
          },
          {
            "name": "collateralVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "collateralVaultNonce",
            "type": "u8"
          },
          {
            "name": "depositHistory",
            "type": "publicKey"
          },
          {
            "name": "tradeHistory",
            "type": "publicKey"
          },
          {
            "name": "fundingPaymentHistory",
            "type": "publicKey"
          },
          {
            "name": "fundingRateHistory",
            "type": "publicKey"
          },
          {
            "name": "liquidationHistory",
            "type": "publicKey"
          },
          {
            "name": "insuranceVault",
            "type": "publicKey"
          },
          {
            "name": "insuranceVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "insuranceVaultNonce",
            "type": "u8"
          },
          {
            "name": "treasuryVault",
            "type": "publicKey"
          },
          {
            "name": "treasuryVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "treasuryVaultNonce",
            "type": "u8"
          },
          {
            "name": "markets",
            "type": "publicKey"
          },
          {
            "name": "padding0",
            "type": "u64"
          },
          {
            "name": "padding1",
            "type": "u64"
          },
          {
            "name": "padding2",
            "type": "u64"
          },
          {
            "name": "padding3",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "markets",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "markets",
            "type": {
              "array": [
                {
                  "defined": "Market"
                },
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "fundingData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketIndex",
            "type": "u16"
          },
          {
            "name": "side",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "lastIncrementTs",
            "type": "u64"
          },
          {
            "name": "fundingRecordsTier0",
            "type": {
              "defined": "FundingRecordsTier"
            }
          },
          {
            "name": "fundingRecordsTier1",
            "type": {
              "defined": "FundingRecordsTier"
            }
          },
          {
            "name": "fundingRecordsTier2",
            "type": {
              "defined": "FundingRecordsTier"
            }
          }
        ]
      }
    },
    {
      "name": "collateralVaultPosition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": "publicKey"
          },
          {
            "name": "markets",
            "type": "publicKey"
          },
          {
            "name": "marketIndex",
            "type": "u16"
          },
          {
            "name": "side",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "collateralMint",
            "type": "publicKey"
          },
          {
            "name": "collateralVault",
            "type": "publicKey"
          },
          {
            "name": "depositAmount",
            "type": "u64"
          },
          {
            "name": "depositTimestamp",
            "type": "u64"
          },
          {
            "name": "cumulativeFeesPerDepositorCollateralAtDeposit",
            "type": "u64"
          },
          {
            "name": "cumulativeTradingDifferencePerDepositorCollateralAtDeposit",
            "type": "i64"
          },
          {
            "name": "padding0",
            "type": "publicKey"
          },
          {
            "name": "padding1",
            "type": "publicKey"
          },
          {
            "name": "padding2",
            "type": "u64"
          },
          {
            "name": "padding3",
            "type": "u64"
          },
          {
            "name": "padding4",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "cumulativeDeposits",
            "type": "u64"
          },
          {
            "name": "cumulativeWithdrawals",
            "type": "u64"
          },
          {
            "name": "collateral",
            "type": "i64"
          },
          {
            "name": "positions",
            "type": "publicKey"
          },
          {
            "name": "history",
            "type": "publicKey"
          },
          {
            "name": "padding0",
            "type": "publicKey"
          },
          {
            "name": "padding1",
            "type": "publicKey"
          },
          {
            "name": "padding2",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "userPositions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "positions",
            "type": {
              "array": [
                {
                  "defined": "Position"
                },
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "userHistory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "records",
            "type": {
              "array": [
                {
                  "defined": "OrderRecord"
                },
                100
              ]
            }
          },
          {
            "name": "head",
            "type": "u64"
          },
          {
            "name": "tail",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "index",
            "type": "u16"
          },
          {
            "name": "marketPaused",
            "type": "bool"
          },
          {
            "name": "mintQuote",
            "type": "publicKey"
          },
          {
            "name": "mintBase",
            "type": "publicKey"
          },
          {
            "name": "oraclePriceFeed",
            "type": "publicKey"
          },
          {
            "name": "oraclePrice",
            "type": "u64"
          },
          {
            "name": "oraclePriceTs",
            "type": "u64"
          },
          {
            "name": "emaNumeratorSum",
            "type": "u128"
          },
          {
            "name": "emaDenominatorSum",
            "type": "u128"
          },
          {
            "name": "emaTs",
            "type": "u64"
          },
          {
            "name": "callMarketData",
            "type": {
              "defined": "MarketSideData"
            }
          },
          {
            "name": "putMarketData",
            "type": {
              "defined": "MarketSideData"
            }
          },
          {
            "name": "fundingInterval",
            "type": "u64"
          },
          {
            "name": "collateralRatioTarget",
            "type": "u64"
          },
          {
            "name": "collateralRatioMax",
            "type": "u64"
          },
          {
            "name": "collateralRatioDelever",
            "type": "u64"
          },
          {
            "name": "minimumBaseAssetTradeSize",
            "type": "u64"
          },
          {
            "name": "collateralMint",
            "type": "publicKey"
          },
          {
            "name": "collateralDecimals",
            "type": "u32"
          },
          {
            "name": "symbolQuote",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "symbolBase",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "padding0",
            "type": "i64"
          },
          {
            "name": "padding1",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "MarketSideData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "side",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "collateralVault",
            "type": "publicKey"
          },
          {
            "name": "collateralVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "collateralVaultNonce",
            "type": "u8"
          },
          {
            "name": "markPrice",
            "type": "u64"
          },
          {
            "name": "markPriceTs",
            "type": "u64"
          },
          {
            "name": "quoteAssetAmountLong",
            "type": "i64"
          },
          {
            "name": "quoteAssetAmountShort",
            "type": "i64"
          },
          {
            "name": "quoteAssetAmountNet",
            "type": "i64"
          },
          {
            "name": "fundingRate",
            "type": "i64"
          },
          {
            "name": "fundingRateTs",
            "type": "u64"
          },
          {
            "name": "fundingData",
            "type": "publicKey"
          },
          {
            "name": "markVolatility",
            "type": "u64"
          },
          {
            "name": "currentDepositorCollateral",
            "type": "u64"
          },
          {
            "name": "cumulativeFeesPerDepositorCollateral",
            "type": "u64"
          },
          {
            "name": "cumulativeTradingDifferencePerDepositorCollateral",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "FundingRecordsTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "head",
            "type": "u64"
          },
          {
            "name": "tail",
            "type": "u64"
          },
          {
            "name": "intervalSec",
            "type": "u64"
          },
          {
            "name": "fundingRecords",
            "type": {
              "array": [
                {
                  "defined": "FundingRecord"
                },
                100
              ]
            }
          }
        ]
      }
    },
    {
      "name": "FundingRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "u64"
          },
          {
            "name": "endTs",
            "type": "u64"
          },
          {
            "name": "fundingRate",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "Position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "positionIndex",
            "type": "u16"
          },
          {
            "name": "marketIndex",
            "type": "u16"
          },
          {
            "name": "side",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "quoteAssetAmount",
            "type": "i64"
          },
          {
            "name": "totalCollateralDeposits",
            "type": "i64"
          },
          {
            "name": "additionalCollateralDeposits",
            "type": "i64"
          },
          {
            "name": "lastCumulativeFunding",
            "type": "i64"
          },
          {
            "name": "lastFundingTs",
            "type": "u64"
          },
          {
            "name": "padding0",
            "type": "u64"
          },
          {
            "name": "padding1",
            "type": "u64"
          },
          {
            "name": "padding2",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "OrderRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketIndex",
            "type": "u16"
          },
          {
            "name": "optionSide",
            "type": {
              "defined": "OptionSide"
            }
          },
          {
            "name": "orderSide",
            "type": {
              "defined": "OrderSide"
            }
          },
          {
            "name": "positionChangeDirection",
            "type": {
              "defined": "PositionChangeDirection"
            }
          },
          {
            "name": "quoteAmount",
            "type": "i64"
          },
          {
            "name": "baseAmount",
            "type": "u64"
          },
          {
            "name": "collateralDeposits",
            "type": "i64"
          },
          {
            "name": "collateralReturned",
            "type": "i64"
          },
          {
            "name": "cumulativeFunding",
            "type": "i64"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "ts",
            "type": "u64"
          },
          {
            "name": "padding0",
            "type": "u64"
          },
          {
            "name": "padding1",
            "type": "u64"
          },
          {
            "name": "padding2",
            "type": "i64"
          },
          {
            "name": "padding3",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "OptionSide",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Call"
          },
          {
            "name": "Put"
          }
        ]
      }
    },
    {
      "name": "OrderSide",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Long"
          },
          {
            "name": "Short"
          }
        ]
      }
    },
    {
      "name": "PositionChangeDirection",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Increase"
          },
          {
            "name": "Decrease"
          }
        ]
      }
    },
    {
      "name": "ExposureStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Delever"
          },
          {
            "name": "AboveMax"
          },
          {
            "name": "AboveTarget"
          },
          {
            "name": "BelowTarget"
          }
        ]
      }
    },
    {
      "name": "ExposureDirection",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Increase"
          },
          {
            "name": "Decrease"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NonZeroCollateralAfterClose",
      "msg": "Non-zero collateral after position close"
    },
    {
      "code": 6001,
      "name": "CrossPositionChange",
      "msg": "Cross position change"
    },
    {
      "code": 6002,
      "name": "MarketExposureAboveMax",
      "msg": "Market exposure is above max and this trade does not reduce exposure"
    },
    {
      "code": 6003,
      "name": "InvalidOraclePriceFeed",
      "msg": "Invalid oracle price feed"
    },
    {
      "code": 6004,
      "name": "InvalidCollateralAccountForMarket",
      "msg": "Invalid collateral account for given market"
    },
    {
      "code": 6005,
      "name": "InvalidFundingRateAccountForMarketData",
      "msg": "Invalid funding rate account for given market"
    },
    {
      "code": 6006,
      "name": "InvalidCollateralAccountAuthorityForMarket",
      "msg": "Invalid collateral account authority for given market"
    },
    {
      "code": 6007,
      "name": "InvalidCollateralAccountAuthority",
      "msg": "Tides is not the collateral account owner"
    },
    {
      "code": 6008,
      "name": "InvalidTreasuryAccountAuthority",
      "msg": "Tides is not the insurance account owner"
    },
    {
      "code": 6009,
      "name": "InvalidInsuranceAccountAuthority",
      "msg": "Tides is not the treasury account owner"
    },
    {
      "code": 6010,
      "name": "InsufficientDeposit",
      "msg": "Insufficient deposit"
    },
    {
      "code": 6011,
      "name": "InsufficientCollateral",
      "msg": "Insufficient collateral"
    },
    {
      "code": 6012,
      "name": "OrderTooLargeForVaultCollateral",
      "msg": "Order too large for vault collateral"
    },
    {
      "code": 6013,
      "name": "SufficientCollateral",
      "msg": "Sufficient collateral"
    },
    {
      "code": 6014,
      "name": "MaxNumberOfPositions",
      "msg": "Max number of positions taken"
    },
    {
      "code": 6015,
      "name": "PositionNotFound",
      "msg": "Position with these parameters not found"
    },
    {
      "code": 6016,
      "name": "AdminControlsPricesDisabled",
      "msg": "Admin Controls Prices Disabled"
    },
    {
      "code": 6017,
      "name": "MarketIndexNotInitialized",
      "msg": "Market Index Not Initialized"
    },
    {
      "code": 6018,
      "name": "MarketIndexAlreadyInitialized",
      "msg": "Market Index Already Initialized"
    },
    {
      "code": 6019,
      "name": "UserAccountAndUserPositionsAccountMismatch",
      "msg": "User Account And User Positions Account Mismatch"
    },
    {
      "code": 6020,
      "name": "UserHasNoPositionInMarket",
      "msg": "User Has No Position In Market"
    },
    {
      "code": 6021,
      "name": "InvalidInitialPeg",
      "msg": "Invalid Initial Peg"
    },
    {
      "code": 6022,
      "name": "InvalidRepegRedundant",
      "msg": "AMM repeg already configured with amt given"
    },
    {
      "code": 6023,
      "name": "InvalidRepegDirection",
      "msg": "AMM repeg incorrect repeg direction"
    },
    {
      "code": 6024,
      "name": "InvalidRepegProfitability",
      "msg": "AMM repeg out of bounds pnl"
    },
    {
      "code": 6025,
      "name": "SlippageOutsideLimit",
      "msg": "Slippage Outside Limit Price"
    },
    {
      "code": 6026,
      "name": "NegativeAssetCalculation",
      "msg": "Negative asset calculation"
    },
    {
      "code": 6027,
      "name": "TradeSizeTooSmall",
      "msg": "Trade Size Too Small"
    },
    {
      "code": 6028,
      "name": "TradeSizeZero",
      "msg": "Quote Size Cannot Be Zero"
    },
    {
      "code": 6029,
      "name": "InvalidUpdateK",
      "msg": "Price change too large when updating K"
    },
    {
      "code": 6030,
      "name": "AdminWithdrawTooLarge",
      "msg": "Admin tried to withdraw amount larger than fees collected"
    },
    {
      "code": 6031,
      "name": "MathError",
      "msg": "Math Error"
    },
    {
      "code": 6032,
      "name": "BnConversionError",
      "msg": "Conversion to u128/u64 failed with an overflow or underflow"
    },
    {
      "code": 6033,
      "name": "ClockUnavailable",
      "msg": "Clock unavailable"
    },
    {
      "code": 6034,
      "name": "UnableToLoadOracle",
      "msg": "Unable To Load Oracles"
    },
    {
      "code": 6035,
      "name": "OracleMarkSpreadLimit",
      "msg": "Oracle/Mark Spread Too Large"
    },
    {
      "code": 6036,
      "name": "HistoryAlreadyInitialized",
      "msg": "Tides history already initialized"
    },
    {
      "code": 6037,
      "name": "PositionAlreadyInitialized",
      "msg": "Position already initialized"
    },
    {
      "code": 6038,
      "name": "MarketPaused",
      "msg": "Market is paused"
    },
    {
      "code": 6039,
      "name": "MarketNotPaused",
      "msg": "Market is not paused"
    },
    {
      "code": 6040,
      "name": "PositionsNotClosed",
      "msg": "Positions must all be closed to close the market"
    },
    {
      "code": 6041,
      "name": "MarketStillInitialized",
      "msg": "Market is still initialized"
    },
    {
      "code": 6042,
      "name": "ExchangePaused",
      "msg": "Exchange is paused"
    },
    {
      "code": 6043,
      "name": "InvalidWhitelistToken",
      "msg": "Invalid whitelist token"
    },
    {
      "code": 6044,
      "name": "WhitelistTokenNotFound",
      "msg": "Whitelist token not found"
    },
    {
      "code": 6045,
      "name": "InvalidDiscountToken",
      "msg": "Invalid discount token"
    },
    {
      "code": 6046,
      "name": "DiscountTokenNotFound",
      "msg": "Discount token not found"
    },
    {
      "code": 6047,
      "name": "InvalidReferrer",
      "msg": "Invalid referrer"
    },
    {
      "code": 6048,
      "name": "ReferrerNotFound",
      "msg": "Referrer not found"
    },
    {
      "code": 6049,
      "name": "InvalidOracle",
      "msg": "InvalidOracle"
    },
    {
      "code": 6050,
      "name": "OracleNotFound",
      "msg": "OracleNotFound"
    },
    {
      "code": 6051,
      "name": "LiquidationsBlockedByOracle",
      "msg": "Liquidations Blocked By Oracle"
    },
    {
      "code": 6052,
      "name": "UserMaxDeposit",
      "msg": "Can not deposit more than max deposit"
    },
    {
      "code": 6053,
      "name": "CantDeleteUserWithCollateral",
      "msg": "Can not delete user that still has collateral"
    },
    {
      "code": 6054,
      "name": "InvalidFundingProfitability",
      "msg": "AMM funding out of bounds pnl"
    },
    {
      "code": 6055,
      "name": "CastingFailure",
      "msg": "Casting Failure"
    },
    {
      "code": 6056,
      "name": "InvalidOrder",
      "msg": "Invalid Order"
    },
    {
      "code": 6057,
      "name": "UserHasNoOrder",
      "msg": "User has no order"
    },
    {
      "code": 6058,
      "name": "OrderAmountTooSmall",
      "msg": "Order Amount Too Small"
    },
    {
      "code": 6059,
      "name": "MaxNumberOfOrders",
      "msg": "Max number of orders taken"
    },
    {
      "code": 6060,
      "name": "OrderDoesNotExist",
      "msg": "Order does not exist"
    },
    {
      "code": 6061,
      "name": "OrderNotOpen",
      "msg": "Order not open"
    },
    {
      "code": 6062,
      "name": "CouldNotFillOrder",
      "msg": "CouldNotFillOrder"
    },
    {
      "code": 6063,
      "name": "ReduceOnlyOrderIncreasedRisk",
      "msg": "Reduce only order increased risk"
    },
    {
      "code": 6064,
      "name": "OrderStateAlreadyInitialized",
      "msg": "Order state already initialized"
    },
    {
      "code": 6065,
      "name": "UnableToLoadAccountLoader",
      "msg": "Unable to load AccountLoader"
    },
    {
      "code": 6066,
      "name": "TradeSizeTooLarge",
      "msg": "Trade Size Too Large"
    },
    {
      "code": 6067,
      "name": "UnableToWriteToRemainingAccount",
      "msg": "Unable to write to remaining account"
    },
    {
      "code": 6068,
      "name": "UserCantReferThemselves",
      "msg": "User cant refer themselves"
    },
    {
      "code": 6069,
      "name": "DidNotReceiveExpectedReferrer",
      "msg": "Did not receive expected referrer"
    },
    {
      "code": 6070,
      "name": "CouldNotDeserializeReferrer",
      "msg": "Could not deserialize referrer"
    },
    {
      "code": 6071,
      "name": "MarketOrderMustBeInPlaceAndFill",
      "msg": "Market order must be in place and fill"
    },
    {
      "code": 6072,
      "name": "UserOrderIdAlreadyInUse",
      "msg": "User Order Id Already In Use"
    },
    {
      "code": 6073,
      "name": "PositionCannotBeLiquidated",
      "msg": "Position cannot be liquidated"
    },
    {
      "code": 6074,
      "name": "InvalidMarginRatio",
      "msg": "Invalid Margin Ratio"
    },
    {
      "code": 6075,
      "name": "CantCancelPostOnlyOrder",
      "msg": "Cant Cancel Post Only Order"
    },
    {
      "code": 6076,
      "name": "InvalidOracleOffset",
      "msg": "InvalidOracleOffset"
    },
    {
      "code": 6077,
      "name": "CantExpireOrders",
      "msg": "CantExpireOrders"
    },
    {
      "code": 6078,
      "name": "UserMustForgoSettlement",
      "msg": "UserMustForgoSettlement"
    },
    {
      "code": 6079,
      "name": "NoAvailableCollateralToBeClaimed",
      "msg": "NoAvailableCollateralToBeClaimed"
    },
    {
      "code": 6080,
      "name": "SettlementNotEnabled",
      "msg": "SettlementNotEnabled"
    },
    {
      "code": 6081,
      "name": "MustCallSettlePositionFirst",
      "msg": "MustCallSettlePositionFirst"
    }
  ]
};

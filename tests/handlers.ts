import * as anchor from '@project-serum/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createAssociatedTokenAccount, createMint, mintTo } from '@solana/spl-token';
import { TidesClient } from '../app/src/TidesClient'
import { AnchorProvider, Wallet } from '@project-serum/anchor';
import { mockOracle } from './utils/mockOracle';
import { BN } from 'bn.js';
import { CollateralVaultPosition, CollateralVaultPositionWrapped, MarketSideData, OptionSide, Position } from '../app/src/types';
import { assert } from 'chai';
import { getCollateralVaultPositionsForUser } from '../app/src/rpc/data';

describe("tides", () => {
  // client for test user A
  const providerA = anchor.AnchorProvider.local();
  anchor.setProvider(providerA);
  const programA = anchor.workspace.Tides;
  const tidesA = new TidesClient(providerA, { network: 'localnet' }, programA)

  // client for test user B
  const userBKeypair = Keypair.generate();
  const userBWallet = new Wallet(userBKeypair)
  const providerB = new AnchorProvider(providerA.connection, userBWallet, providerA.opts);
  anchor.setProvider(providerB);
  const programB = anchor.workspace.Tides;
  const tidesB = new TidesClient(providerB, { network: 'localnet' }, programB)

  let collateralMint: PublicKey

  it("initialize", async () => {
    const mintPayer = Keypair.generate();
    const mintAuthority = Keypair.generate();

    // mint payer to create tokens
    await providerA.connection.confirmTransaction(
      await providerA.connection.requestAirdrop(
        mintPayer.publicKey,
        LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    // user B to initialize account
    await providerB.connection.confirmTransaction(
      await providerB.connection.requestAirdrop(
        userBKeypair.publicKey,
        LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    collateralMint = await createMint(
      providerA.connection,
      mintPayer,
      mintAuthority.publicKey,
      null,
      6
    );

    const userA_ATA = await createAssociatedTokenAccount(
      providerA.connection,
      mintPayer,
      collateralMint,
      providerA.wallet.publicKey
    );

    const userB_ATA = await createAssociatedTokenAccount(
      providerB.connection,
      mintPayer,
      collateralMint,
      providerB.wallet.publicKey
    );

    await mintTo(
      providerA.connection,
      mintPayer,
      collateralMint,
      userA_ATA,
      mintAuthority,
      10 ** 15
    );

    await mintTo(
      providerB.connection,
      mintPayer,
      collateralMint,
      userB_ATA,
      mintAuthority,
      10 ** 15
    );

    await tidesA.initialize(collateralMint)
  });

  it("user_create", async () => {
    await tidesA.userCreate()
    await tidesB.userCreate(userBKeypair)
  });

  it("user_deposit", async () => {
    await tidesA.userDeposit(
      new BN((10 ** 10) + (10 ** 7)), // 10 ** 10 = $10000
      collateralMint
    )

    await tidesB.userDeposit(
      new BN((10 ** 12)),
      collateralMint,
      userBKeypair
    )
  });

  it("user_withdraw", async () => {
    await tidesA.userWithdraw(
      new BN(10 ** 7), // 10 ** 7 = $10
      collateralMint
    )
  });

  it("market_add", async () => {
    const oraclePriceFeed = await mockOracle()
    await tidesA.marketAdd(
      "SOL",
      "USDC",
      collateralMint, // dummy value, should be the quote mint
      oraclePriceFeed
    )
  });

  it("market_pause", async () => {
    await tidesA.marketPause(0)
  });

  it("market_resume", async () => {
    await tidesA.marketResume(0)
  });

  it("market_side_deposit", async () => {
    await tidesA.marketSideDeposit(
      0,
      OptionSide.Call,
      new BN(10 ** 11), // 10 ** 10 = $10k
    )

    await tidesA.marketSideDeposit(
      0,
      OptionSide.Put,
      new BN(10 ** 11), // 10 ** 10 = $10k
    )
  });

  it("market_stats_update", async () => {
    await tidesA.marketStatsUpdate(0)
  });

  it("collateral_vault_position_open, open call/put", async () => {
    const market = await tidesA.getMarketByIndex(0)

    let amount = 10000 * (10 ** market.collateralDecimals)
    await tidesA.collateralVaultPositionOpenBothSides(0, new BN(amount))
  });

  it("position_change call<>long<>increase $1000", async () => {
    const marketStart = await tidesA.getMarketByIndex(0)
    const markPriceStart = (marketStart.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolStart = (marketStart.callMarketData as MarketSideData).markVolatility.toNumber()

    const baseUnits = 1000
    const baseSpend = baseUnits * (10 ** marketStart.collateralDecimals)

    try {
      await tidesA.positionChange(
        0,
        OptionSide.Call,
        (baseSpend / markPriceStart) * (10 ** marketStart.collateralDecimals),
        baseSpend,
        500, // 500 = 5%
        false,
        false,
      )
    } catch (e) {
      console.log(e)
    }

    const marketEnd = await tidesA.getMarketByIndex(0)
    const markPriceEnd = (marketEnd.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolEnd = (marketEnd.callMarketData as MarketSideData).markVolatility.toNumber()

    assert(markPriceEnd > markPriceStart)
    assert(markVolEnd > markVolStart)

    const [positions] = await tidesA.getUserPositions()
    const position = (positions.positions as Position[]).find((x) => x.marketIndex == marketStart.index)

    assert((marketEnd.callMarketData as MarketSideData).quoteAssetAmountNet.toNumber() == position?.quoteAssetAmount.toNumber())
  });

  it("position_change call<>long<>increase $200", async () => {
    const marketStart = await tidesA.getMarketByIndex(0)
    const markPriceStart = (marketStart.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolStart = (marketStart.callMarketData as MarketSideData).markVolatility.toNumber()

    const baseUnits = 200
    const baseSpend = baseUnits * (10 ** marketStart.collateralDecimals)

    await tidesA.positionChange(
      0,
      OptionSide.Call,
      (baseSpend / markPriceStart) * (10 ** marketStart.collateralDecimals),
      baseSpend,
      500, // 500 = 5%
      false,
      false,
    )

    const marketEnd = await tidesA.getMarketByIndex(0)
    const markPriceEnd = (marketEnd.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolEnd = (marketEnd.callMarketData as MarketSideData).markVolatility.toNumber()

    assert(markPriceEnd > markPriceStart)
    assert(markVolEnd > markVolStart)

    const [positions] = await tidesA.getUserPositions()
    const position = (positions.positions as Position[]).find((x) => x.marketIndex == marketStart.index)

    assert((marketEnd.callMarketData as MarketSideData).quoteAssetAmountNet.toNumber() == position?.quoteAssetAmount.toNumber())
  });

  it("position_change call<>long<>decrease $500", async () => {
    const marketStart = await tidesA.getMarketByIndex(0)
    const markPriceStart = (marketStart.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolStart = (marketStart.callMarketData as MarketSideData).markVolatility.toNumber()

    const baseUnits = 500
    const baseSpend = baseUnits * (10 ** marketStart.collateralDecimals)

    try {
      await tidesA.positionChange(
        0,
        OptionSide.Call,
        -(baseSpend / markPriceStart) * (10 ** marketStart.collateralDecimals),
        baseSpend,
        500, // 500 = 5%
        false,
        true,
      )
    } catch (e) {
      console.log(e)
    }

    const marketEnd = await tidesA.getMarketByIndex(0)
    const markPriceEnd = (marketEnd.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolEnd = (marketEnd.callMarketData as MarketSideData).markVolatility.toNumber()

    assert(markPriceEnd < markPriceStart)
    assert(markVolEnd < markVolStart)

    const [positionsEnd] = await tidesA.getUserPositions()
    const positionEnd = (positionsEnd.positions as Position[]).find((x) => x.marketIndex == marketStart.index)

    assert((marketEnd.callMarketData as MarketSideData).quoteAssetAmountNet.toNumber() == positionEnd?.quoteAssetAmount.toNumber())
  });

  it("position_change call<>long<>decrease close remaining", async () => {
    const marketStart = await tidesA.getMarketByIndex(0)
    const markPriceStart = (marketStart.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolStart = (marketStart.callMarketData as MarketSideData).markVolatility.toNumber()

    const [positionsStart] = await tidesA.getUserPositions()
    const positionStart = (positionsStart.positions as Position[]).find((x) => x.marketIndex == marketStart.index)

    const quoteAmount = positionStart?.quoteAssetAmount.toNumber() || 0
    const baseAmount = quoteAmount * markPriceStart / (10 ** marketStart.collateralDecimals)

    try {
      await tidesA.positionChange(
        0,
        OptionSide.Call,
        -quoteAmount,
        baseAmount,
        500, // 500 = 5%
        true,
        true,
      )
    } catch (e) {
      console.log(e)
    }

    const marketEnd = await tidesA.getMarketByIndex(0)
    const markPriceEnd = (marketEnd.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolEnd = (marketEnd.callMarketData as MarketSideData).markVolatility.toNumber()

    assert(markPriceEnd < markPriceStart)
    assert(markVolEnd < markVolStart)

    const [positionsEnd] = await tidesA.getUserPositions()
    const positionEnd = (positionsEnd.positions as Position[]).find((x) => x.marketIndex == marketStart.index)

    assert((marketEnd.callMarketData as MarketSideData).quoteAssetAmountNet.toNumber() == positionEnd?.quoteAssetAmount.toNumber())
  });

  it("position_change call<>short<>increase $100", async () => {
    const marketStart = await tidesA.getMarketByIndex(0)
    const markPriceStart = (marketStart.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolStart = (marketStart.callMarketData as MarketSideData).markVolatility.toNumber()

    const baseUnits = 100
    const baseSpend = baseUnits * (10 ** marketStart.collateralDecimals)

    try {
      await tidesA.positionChange(
        0,
        OptionSide.Call,
        -(baseSpend / markPriceStart) * (10 ** marketStart.collateralDecimals),
        baseSpend,
        500, // 500 = 5%
        false,
        false,
      )
    } catch (e) {
      console.log(e)
    }

    const marketEnd = await tidesA.getMarketByIndex(0)
    const markPriceEnd = (marketEnd.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolEnd = (marketEnd.callMarketData as MarketSideData).markVolatility.toNumber()

    assert(markPriceEnd < markPriceStart)
    assert(markVolEnd < markVolStart)

    const [positions] = await tidesA.getUserPositions()
    const position = (positions.positions as Position[]).find((x) => x.marketIndex == marketStart.index)

    assert((marketEnd.callMarketData as MarketSideData).quoteAssetAmountNet.toNumber() == position?.quoteAssetAmount.toNumber())
  });

  it("position_change call<>short<>decrease $50", async () => {
    const marketStart = await tidesA.getMarketByIndex(0)
    const markPriceStart = (marketStart.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolStart = (marketStart.callMarketData as MarketSideData).markVolatility.toNumber()

    const baseUnits = 50
    const baseSpend = baseUnits * (10 ** marketStart.collateralDecimals)

    try {
      await tidesA.positionChange(
        0,
        OptionSide.Call,
        (baseSpend / markPriceStart) * (10 ** marketStart.collateralDecimals),
        baseSpend,
        500, // 500 = 5%
        false,
        true,
      )
    } catch (e) {
      console.log(e)
    }

    const marketEnd = await tidesA.getMarketByIndex(0)
    const markPriceEnd = (marketEnd.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolEnd = (marketEnd.callMarketData as MarketSideData).markVolatility.toNumber()

    assert(markPriceEnd > markPriceStart)
    assert(markVolEnd > markVolStart)

    const [positions] = await tidesA.getUserPositions()
    const position = (positions.positions as Position[]).find((x) => x.marketIndex == marketStart.index)

    assert((marketEnd.callMarketData as MarketSideData).quoteAssetAmountNet.toNumber() == position?.quoteAssetAmount.toNumber())
  });

  it("position_change call<>short<>decrease close remaining", async () => {
    const marketStart = await tidesA.getMarketByIndex(0)
    const markPriceStart = (marketStart.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolStart = (marketStart.callMarketData as MarketSideData).markVolatility.toNumber()

    const [positionsStart] = await tidesA.getUserPositions()
    const positionStart = (positionsStart.positions as Position[]).find((x) => x.marketIndex == marketStart.index)

    const quoteAmount = Math.abs(positionStart?.quoteAssetAmount.toNumber() || 0)
    const baseAmount = quoteAmount * markPriceStart / (10 ** marketStart.collateralDecimals)

    await tidesA.positionChange(
      0,
      OptionSide.Call,
      quoteAmount,
      baseAmount,
      500, // 500 = 5%
      true,
      true,
    )

    const marketEnd = await tidesA.getMarketByIndex(0)
    const markPriceEnd = (marketEnd.callMarketData as MarketSideData).markPrice.toNumber()
    const markVolEnd = (marketEnd.callMarketData as MarketSideData).markVolatility.toNumber()

    assert(markPriceEnd > markPriceStart)
    assert(markVolEnd > markVolStart)

    const [positions] = await tidesA.getUserPositions()
    const position = (positions.positions as Position[]).find((x) => x.marketIndex == marketStart.index)

    assert((marketEnd.callMarketData as MarketSideData).quoteAssetAmountNet.toNumber() == position?.quoteAssetAmount.toNumber())
  });

  it("collateral_vault_position_close, close call/put", async () => {
    // const market = await tidesA.getMarketByIndex(0)

    const positions = await getCollateralVaultPositionsForUser(tidesA.program, tidesA.provider.publicKey) as [CollateralVaultPosition, PublicKey][]

    // console.log((market.callMarketData as MarketSideData).cumulativeFeesPerDepositorCollateral.toNumber())
    // console.log((market.callMarketData as MarketSideData).cumulativeTradingDifferencePerDepositorCollateral.toNumber())

    await tidesA.collateralVaultPositionClose(positions[0][1])
    await tidesA.collateralVaultPositionClose(positions[1][1])
  });

  it("funding_rate_update", async () => {
    await tidesA.marketStatsUpdate(0)

    const market = await tidesA.getMarketByIndex(0)
    const fundingRate = (market.callMarketData as MarketSideData).fundingRate

    assert(fundingRate.toNumber() != 0)
  });

  // it("liqudation - small short, large long, liq", async () => {
  //   // ==== small short, user A
  //   let market = await tidesA.getMarketByIndex(0)
  //   let markPrice = (market.callMarketData as MarketSideData).markPrice.toNumber()

  //   let baseUnits = 10
  //   let baseSpend = baseUnits * (10 ** market.collateralDecimals)

  //   await tidesA.positionChange(
  //     0,
  //     OptionSide.Call,
  //     -(baseSpend / markPrice) * (10 ** market.collateralDecimals),
  //     baseSpend,
  //     500, // 500 = 5%
  //     false,
  //     false,
  //   )

  //   const [positions] = await tidesA.getUserPositions()
  //   const position = (positions.positions as Position[]).find((x) => x.marketIndex == market.index)

  //   // ==== big long, user B
  //   market = await tidesA.getMarketByIndex(0)
  //   markPrice = (market.callMarketData as MarketSideData).markPrice.toNumber()

  //   baseUnits = 10000
  //   baseSpend = baseUnits * (10 ** market.collateralDecimals)

  //   await tidesB.positionChange(
  //     0,
  //     OptionSide.Call,
  //     (baseSpend / markPrice) * (10 ** market.collateralDecimals),
  //     baseSpend,
  //     10000, // 500 = 5%
  //     false,
  //     false,
  //     userBKeypair
  //   )

  //   // ==== liquidate!
  //   market = await tidesA.getMarketByIndex(0)
  //   markPrice = (market.callMarketData as MarketSideData).markPrice.toNumber()

  //   const quoteAmount = Math.abs(position?.quoteAssetAmount.toNumber() || 0)
  //   const baseAmount = quoteAmount * markPrice / (10 ** market.collateralDecimals)

  //   await tidesB.positionLiquidate(
  //     tidesA.provider.publicKey,
  //     0,
  //     OptionSide.Call,
  //     quoteAmount,
  //     baseAmount,
  //     userBKeypair
  //   )

  // });

  it("market_side_withdraw", async () => {
    await tidesA.marketSideWithdraw(
      0,
      OptionSide.Call,
      new BN(1)
    )
  });

  it("insurance_withdraw", async () => {
    await tidesA.insuranceWithdraw(
      new BN(1)
    )
  });

  it("treasury_withdraw", async () => {
    await tidesA.treasuryWithdraw(
      new BN(1)
    )
  });

  it("market_close", async () => {
    await tidesA.marketPause(0)
    await tidesA.marketClose(0)
  });

  it("exchange_pause", async () => {
    await tidesA.exchangePause()
  });

  it("exchange_resume", async () => {
    await tidesA.exchangeResume()
  });

});

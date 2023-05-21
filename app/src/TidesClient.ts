import type { Keypair, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import type { Tides as TidesIDLType } from './idl/tides';
import { IDL } from './idl/tides';
import { TIDES_PROGRAM_ID } from './utils/constants';
import {
    getAllUsersData,
    getMarketByIndex,
    getUserData,
    getUserPositions,
} from './rpc/data';
import { userCreate } from './rpc/userCreate';
import type BN from 'bn.js';
import { userDeposit } from './rpc/userDeposit';
import type {
    Market,
    OptionSide,
    Position,
    User,
    UserDataWrapper,
    UserPositions,
} from './types';
import { userWithdraw } from './rpc/userWithdraw';
import { marketAdd } from './rpc/marketAdd';
import { marketPause } from './rpc/marketPause';
import { positionAddCollateral } from './rpc/positionAddCollateral';
import { positionChange, positionChangeIx } from './rpc/positionChange';
import { initialize } from './rpc/initialize';
import { marketResume } from './rpc/marketResume';
import { marketSideDeposit } from './rpc/marketSideDeposit';
import { marketStatsUpdate } from './rpc/marketStatsUpdate';
import { getOptionSideFromData } from './utils/markets';
import { positionLiquidate } from './rpc/positionLiquidate';
import { insuranceWithdraw } from './rpc/insuranceWithdraw'
import { treasuryWithdraw } from './rpc/treasuryWithdraw'
import { marketSideWithdraw } from './rpc/marketSideWithdraw'
import { exchangePause } from './rpc/exchangePause';
import { exchangeResume } from './rpc/exchangeResume';
import { marketClose } from './rpc/marketClose';
import { positionDelever } from './rpc/positionDelever';
import { marketsDestroy } from './rpc/marketsDestroy';
import { collateralVaultPositionOpenBothSides, collateralVaultPositionOpen } from './rpc/collateralVaultPositionOpen';
import { collateralVaultPositionClose } from './rpc/collateralVaultPositionClose';
import { globalCollateralWithdraw } from './rpc/globalCollateralWithdraw';

export type TidesClientOptions = {
    network?: string;
    api?: boolean;
};

const DEFAULT_OPTIONS = {
    network: 'mainnet-beta',
    api: false,
};

export class TidesClient {
    public readonly provider: AnchorProvider;

    public readonly program: Program<TidesIDLType>;

    public readonly options: TidesClientOptions;

    constructor(
        provider: AnchorProvider,
        options: TidesClientOptions = DEFAULT_OPTIONS,
        program?: Program<TidesIDLType>,
    ) {
        this.provider = provider;
        this.program = program
            ? program
            : new Program<TidesIDLType>(IDL, TIDES_PROGRAM_ID, provider);
        this.options = options;
    }

    async initialize(collateralMint: PublicKey) {
        return initialize(this.program, this.provider, collateralMint);
    }

    async userCreate(devTestKeyPair?: Keypair) {
        return userCreate(this.program, this.provider, devTestKeyPair);
    }

    async userDeposit(
        amount: BN,
        collateralMint: PublicKey,
        devTestKeyPair?: Keypair,
    ) {
        return userDeposit(
            this.program,
            this.provider,
            amount,
            collateralMint,
            devTestKeyPair,
        );
    }

    async userWithdraw(amount: BN, collateralMint: PublicKey) {
        return userWithdraw(this.program, this.provider, amount, collateralMint);
    }

    async marketAdd(
        quoteSymbol: string,
        baseSymbol: string,
        quoteMint: PublicKey,
        oraclePriceFeed: PublicKey
    ) {
        return marketAdd(this.program, this.provider, quoteSymbol, baseSymbol, quoteMint, oraclePriceFeed);
    }

    async marketPause(marketIndex: number) {
        return marketPause(this.program, this.provider, marketIndex);
    }

    async marketResume(marketIndex: number) {
        return marketResume(this.program, this.provider, marketIndex);
    }

    async marketClose(marketIndex: number) {
        return marketClose(this.program, this.provider, marketIndex);
    }

    async exchangePause() {
        return exchangePause(this.program, this.provider);
    }

    async exchangeResume() {
        return exchangeResume(this.program, this.provider);
    }

    async marketsDestroy() {
        return marketsDestroy(this.program, this.provider);
    }

    async positionChange(
        marketIndex: number,
        optionSide: OptionSide,
        quoteAmount: number,
        baseAmount: number,
        slippageTolerance: number,
        closePosition: boolean,
        reduceOnly: boolean,
        devTestKeyPair?: Keypair,
    ) {
        const userAddr = devTestKeyPair
            ? devTestKeyPair.publicKey
            : this.provider.wallet.publicKey;

        const [userPositionsObj] = await getUserPositions(this.program, userAddr);
        const userPositions = userPositionsObj.positions as Position[];

        const position = userPositions.find(
            x =>
                x.marketIndex === marketIndex &&
                getOptionSideFromData(x.side) === optionSide,
        );

        // the logic here splits a cross-position order into two order legs (i.e.: long -> short ==> long -> 0 -> short)
        if (
            position &&
            ((position.quoteAssetAmount.toNumber() > 0 &&
                position.quoteAssetAmount.toNumber() + quoteAmount < 0) ||
                (position &&
                    position.quoteAssetAmount.toNumber() < 0 &&
                    position.quoteAssetAmount.toNumber() + quoteAmount > 0))
        ) {
            const proportionLeg1 =
                position.quoteAssetAmount.abs().toNumber() / Math.abs(quoteAmount);

            const quoteAmountLeg1 = -position.quoteAssetAmount.toNumber();
            const baseAmountLeg1 = Math.round(baseAmount * proportionLeg1);

            const ix = await positionChangeIx(
                this.program,
                this.provider,
                marketIndex,
                optionSide,
                quoteAmountLeg1,
                baseAmountLeg1,
                slippageTolerance,
                true,
                true,
                devTestKeyPair,
            );

            const quoteAmountLeg2 = quoteAmount - quoteAmountLeg1;
            const baseAmountLeg2 = Math.round(baseAmount * (1 - proportionLeg1));

            return positionChange(
                this.program,
                this.provider,
                marketIndex,
                optionSide,
                quoteAmountLeg2,
                baseAmountLeg2,
                slippageTolerance,
                false,
                false,
                [ix],
                devTestKeyPair,
            );
        } else {
            return positionChange(
                this.program,
                this.provider,
                marketIndex,
                optionSide,
                quoteAmount,
                baseAmount,
                slippageTolerance,
                closePosition,
                reduceOnly,
                [],
                devTestKeyPair,
            );
        }
    }

    async marketSideDeposit(
        marketIndex: number,
        optionSide: OptionSide,
        depositAmount: BN,
    ) {
        return marketSideDeposit(
            this.program,
            this.provider,
            marketIndex,
            optionSide,
            depositAmount,
        );
    }

    async marketSideWithdraw(
        marketIndex: number,
        optionSide: OptionSide,
        withdrawAmount: BN,
    ) {
        return marketSideWithdraw(
            this.program,
            this.provider,
            marketIndex,
            optionSide,
            withdrawAmount
        )
    }

    async collateralVaultPositionOpen(
        marketIndex: number,
        optionSide: OptionSide,
        depositAmount: BN,
    ) {
        return collateralVaultPositionOpen(
            this.program,
            this.provider,
            marketIndex,
            optionSide,
            depositAmount,
        );
    }

    async collateralVaultPositionOpenBothSides(
        marketIndex: number,
        depositAmount: BN,
    ) {
        return collateralVaultPositionOpenBothSides(
            this.program,
            this.provider,
            marketIndex,
            depositAmount,
        );
    }

    async collateralVaultPositionClose(
        positionAddr: PublicKey,
    ) {
        return collateralVaultPositionClose(
            this.program,
            this.provider,
            positionAddr,
        )
    }

    async insuranceWithdraw(
        withdrawAmount: BN,
    ) {
        return insuranceWithdraw(
            this.program,
            this.provider,
            withdrawAmount
        )
    }

    async treasuryWithdraw(
        withdrawAmount: BN,
    ) {
        return treasuryWithdraw(
            this.program,
            this.provider,
            withdrawAmount
        )
    }

    async globalCollateralWithdraw(
        withdrawAmount: BN,
    ) {
        return globalCollateralWithdraw(
            this.program,
            this.provider,
            withdrawAmount
        )
    }

    async positionAddCollateral(
        marketIndex: number,
        optionSide: OptionSide,
        collateralAmount: number,
    ) {
        return positionAddCollateral(
            this.program,
            this.provider,
            marketIndex,
            optionSide,
            collateralAmount,
        )
    }

    // not yet implemented
    async positionDelever() {
        return positionDelever(
            this.program,
            this.provider,
        )
    }

    async positionLiquidate(
        positionHolderAddr: PublicKey,
        marketIndex: number,
        optionSide: OptionSide,
        quoteAmount: number,
        baseAmount: number,
        devTestKeyPair?: Keypair
    ) {
        return positionLiquidate(
            this.program,
            this.provider,
            positionHolderAddr,
            marketIndex,
            optionSide,
            quoteAmount,
            baseAmount,
            devTestKeyPair
        )
    }

    async marketStatsUpdate(
        marketIndex: number,
    ) {
        return marketStatsUpdate(
            this.program,
            this.provider,
            marketIndex,
        )
    }

    async getUser(
        userAddr?: PublicKey
    ): Promise<[User, PublicKey]> {
        return getUserData(
            this.program,
            userAddr ? userAddr : this.provider.wallet.publicKey
        )
    }

    async getAllUsers(): Promise<UserDataWrapper[]> {
        return getAllUsersData(this.program)
    }

    async getUserPositions(
        userAddr?: PublicKey
    ): Promise<[UserPositions, PublicKey]> {
        return getUserPositions(
            this.program,
            userAddr ? userAddr : this.provider.wallet.publicKey
        )
    }

    async getMarketByIndex(
        marketIndex: number
    ): Promise<Market> {
        return getMarketByIndex(
            this.program,
            marketIndex
        )
    }

}

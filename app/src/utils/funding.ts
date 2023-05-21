import type {
  FundingData,
  Position,
  FundingRecordsTier,
  FundingRecord,
} from '$src/types';

export const getUpdatedFundingForPosition = (
  position: Position,
  fundingData: FundingData,
): number => {
  const existingFunding = position.lastCumulativeFunding.toNumber();
  const newFunding = getTotalFundingSinceTs(
    fundingData,
    position.lastFundingTs.toNumber(),
  );

  // if quoteAsset is long (>0) then pos*pos = pos so we subtract
  // if quoteAsset is short (<0) then pos*neg = neg so we add
  // since default is longs pay shorts the funding rate
  return (
    existingFunding -
    newFunding * (position.quoteAssetAmount.toNumber() / 10 ** 6)
  );
};

function getTotalFundingSinceTs(fundingData: FundingData, ts: number) {
  const tier2Funding = getTierFundingSinceTs(
    fundingData.fundingRecordsTier2,
    ts,
    false
  );
  const tier2LastTs = Math.max(
    getLatestRecordFromTier(
      fundingData.fundingRecordsTier2,
    )?.endTs.toNumber() || 0,
    ts,
  );

  const tier1Funding = getTierFundingSinceTs(
    fundingData.fundingRecordsTier1,
    tier2LastTs,
    false
  );
  const tier1LastTs = Math.max(
    getLatestRecordFromTier(
      fundingData.fundingRecordsTier1,
    )?.endTs.toNumber() || 0,
    ts,
  );

  const tier0Funding = getTierFundingSinceTs(
    fundingData.fundingRecordsTier0,
    tier1LastTs,
  );

  return tier2Funding + tier1Funding + tier0Funding;
}

function getTierFundingSinceTs(
  tier: FundingRecordsTier,
  sinceTs: number,
  returnPartial = true,
): number {
  if (tier.tail.toNumber() == tier.head.toNumber()) {
    return 0;
  }

  const now = new Date().getTime() / 1000;
  let fundingSum = 0;

  // console.log("====")

  for (const record of tier.fundingRecords as FundingRecord[]) {
    // complete interval coverage
    if (sinceTs <= record.startTs.toNumber() && now >= record.endTs.toNumber()) {
      // console.log("complete:", tier.intervalSec.toNumber(), record.startTs.toNumber(), record.endTs.toNumber(), now)

      fundingSum += record.fundingRate.toNumber();
    } else if (
      (
        (sinceTs > record.startTs.toNumber() && sinceTs < record.endTs.toNumber()) ||
        (now > record.startTs.toNumber() && now < record.endTs.toNumber())
      ) && returnPartial
    ) {
      const startCoverage = Math.max(record.startTs.toNumber(), sinceTs);
      const endCoverage = Math.min(record.endTs.toNumber(), now);

      const periodCoverage =
        (endCoverage - startCoverage) /
        (record.endTs.toNumber() - record.startTs.toNumber());

      // console.log("partial:", tier.intervalSec.toNumber(), record.startTs.toNumber(), record.endTs.toNumber(), now, Math.round(100 * periodCoverage) + "%")

      fundingSum += periodCoverage * record.fundingRate.toNumber();
    }
  }

  return fundingSum;
}

function getLatestRecordFromTier(tier: FundingRecordsTier): FundingRecord {
  return (tier.fundingRecords as FundingRecord[])[
    (tier.head.toNumber() - 1) % 100
  ];
}

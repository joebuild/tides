import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { TimestreamConstruct } from './TimestreamConstruct';

export class TimestreamStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const timestreamConstruct = new TimestreamConstruct(
      this,
      'TidesTimestream',
      {
        databaseName: 'Tides',
        tableName: 'Markets',
      },
    );
  }
}

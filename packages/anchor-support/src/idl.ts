/** Anchor IDL v1/v2 compatible types. */
export interface AnchorIdlAccount {
  name: string;
  isMut: boolean;
  isSigner: boolean;
  isOptional?: boolean;
  docs?: string[];
}

export interface AnchorIdlArg {
  name: string;
  type: AnchorIdlType;
}

export type AnchorIdlType =
  | 'bool' | 'u8' | 'u16' | 'u32' | 'u64' | 'u128' | 'i8' | 'i16' | 'i32' | 'i64' | 'i128'
  | 'f32' | 'f64' | 'bytes' | 'string' | 'publicKey'
  | { vec: AnchorIdlType }
  | { option: AnchorIdlType }
  | { defined: string }
  | { array: [AnchorIdlType, number] };

export interface AnchorIdlInstruction {
  name: string;
  docs?: string[];
  accounts: AnchorIdlAccount[];
  args: AnchorIdlArg[];
  discriminant?: { type: string; value: number[] };
}

export interface AnchorIdlTypeDefinition {
  name: string;
  type: { kind: 'struct' | 'enum'; fields?: AnchorIdlArg[] };
}

export interface AnchorIdl {
  version: string;
  name: string;
  instructions: AnchorIdlInstruction[];
  accounts?: AnchorIdlTypeDefinition[];
  types?: AnchorIdlTypeDefinition[];
  errors?: Array<{ code: number; name: string; msg: string }>;
  metadata?: { address: string };
}

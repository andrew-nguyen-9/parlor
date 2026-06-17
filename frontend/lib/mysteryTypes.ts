export interface AlibiEntry {
  alibiId: string;
  characterScope: "generic" | "specific";
  characterId: string;
  roomId: string;
  hour: string;
  alibi: string;
}

export interface WitnessEntry {
  statementId: string;
  characterId: string;
  statementType: "true" | "false";
  statement: string;
  aboutCharacter: string;
  hour: string;
}

export interface EvidenceEntry {
  evidenceId: string;
  characterId: string;
  evidence: string;
  locationFound: string;
  forensicNote: string;
}

export interface SignatureClue {
  clueId: string;
  characterId: string;
  clue: string;
  roomFound: string;
  misleading: boolean;
}

export interface RedHerring {
  redHerringId: string;
  characterId: string;
  redHerring: string;
  apparentImplication: string;
  trueExplanation: string;
}

export interface CharacterContext {
  alibis: AlibiEntry[];
  witnesses: WitnessEntry[];
  evidence: EvidenceEntry[];
  clues: SignatureClue[];
  redHerrings: RedHerring[];
}

export interface MysteryContext {
  byCharacter: Record<string, CharacterContext>;
  loaded: boolean;
}

export interface Game {
  id: number;
  name: string;
  yearpublished: number;
  rank: number;
  bayesaverage: number;
  average: number;
  usersrated: number;
  is_expansion: boolean;

  abstracts_rank: number | null;
  cgs_rank: number | null;
  childrensgames_rank: number | null;
  familygames_rank: number | null;
  partygames_rank: number | null;
  strategygames_rank: number | null;
  thematic_rank: number | null;
  wargames_rank: number | null;

  complexity: number | null;
  width: number | null;
  length: number | null;
  depth: number | null;
  weight: number | null;
}

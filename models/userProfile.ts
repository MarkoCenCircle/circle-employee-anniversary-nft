export type NftResponse = {
  address: string
  tokenId: number
  imageUrl: string
  title: string | null
  description: string | null
  ownerCompanyInfo?: NftCompanyOwnerResponse
};

type NftCompanyOwnerResponse = {
  companyName: string
  companyDomain: string
  companyFoundingDate: string
}

export type ProfileResponse = {
  userId: number
  email: string
  name: string
  joinDate: number
  position?: string

  walletAddress: string
  nfts: NftResponse[];
};

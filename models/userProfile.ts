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
  companyFoundingDate: number
}

export type ProfileResponse = {
  userId: number
  email: string
  firstName: string
  lastName: string
  joinDate: number

  walletAddress: string
  nfts: NftResponse[];
};

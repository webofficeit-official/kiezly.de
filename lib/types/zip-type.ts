export type Zipcode = {
    id: number;
    country_id: string;
    zipcode: string;
    street?: string;
    city?: string;
    state?: string;
    latitude?: string;
    longitude?: string;
};


export interface zipResponse {
  success: boolean;
  message: string;
  data: {
    zipcode: [];
  };
}

export interface LocationSearch {
  zip: string;
  country?: number;
  limit?: string;
}
export interface CreateCampaignPayload {
  name:          string;
  domain:        string;
  description:   string;
  campaign_type: string;
  status:        string;
  start_date:    string;
  end_date:      string;
  keywords:      string[];
  references:    string[];
}

export interface CampaignLookupResponse {
  data: string[];
}

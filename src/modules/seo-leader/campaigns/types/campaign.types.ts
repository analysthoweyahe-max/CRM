export interface CreateCampaignPayload {
  name:          string;
  domain:        string;
  description:   string;
  campaign_type: string;
  status:        string;
  is_draft?:     boolean;
  start_date:    string;
  end_date:      string;
  keywords:      string[];
  references:    string[];
  github_link?:  string;
}

export interface CampaignLookupResponse {
  data: unknown[];
}

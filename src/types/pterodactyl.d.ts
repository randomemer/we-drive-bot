declare global {
  interface PanelAPIResp<T = any> {
    object: string;
    data: T;
    meta: PanelAPIRespMeta;
  }

  interface PanelAPIRespMeta {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
      links: Record<string, any>;
    };
  }

  interface PterodactylServer {
    object: string;
    attributes: {
      server_owner: boolean;
      access_level: string;
      identifier: string;
      internal_id: number;
      external_id: string;
      parent_id: number | null;
      nest_id: number;
      uuid: string;
      name: string;
      node: {
        id: number;
        name: string;
        hetrix_id: string;
        maintenance: boolean;
      };
      egg: {
        id: number;
        name: string;
      };
      location: {
        id: number;
        name_short: string;
      };
      sftp_details: {
        ip: string;
        port: number;
      };
      description: string;
      staff_note: string | null;
      timezone: string;
      limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
        threads: number | null;
        oom_disabled: boolean;
      };
      invocation: string;
      docker_image: string;
      egg_type: string;
      nest_type: string;
      feature_limits: {
        databases: number;
        allocations: number;
        backups: number;
        subdomains: number;
        subservers: number;
      };
      status: string | null;
      is_suspended: boolean;
      is_installing: boolean;
      is_transferring: boolean;
      is_maintenance: boolean;
      is_setup: boolean;
      fastdl_setup: boolean;
      auto_backups_locked: boolean;
      changeable_startup: boolean;
      crash_reporting: boolean;
      crash_restarting: boolean;
      send_crashemail: boolean;
      relationships: {
        allocations: {
          object: string;
          data: Allocation[];
        };
        variables: {
          object: string;
          data: EggVariable[];
        };
        parent: {
          object: string;
          attributes: null;
        };
        subdomains: {
          object: string;
          data: Subdomain[];
        };
      };
    };
  }

  interface Allocation {
    object: string;
    attributes: {
      id: number;
      ip: string;
      ip_alias: string | null;
      port: number;
      notes: string | null;
      is_default: boolean;
      domain: boolean;
    };
  }

  interface EggVariable {
    object: string;
    attributes: {
      name: string;
      description: string;
      env_variable: string;
      default_value: string;
      server_value: string;
      is_editable: boolean;
      rules: string;
      warning: string | null;
    };
  }

  interface Subdomain {
    object: string;
    attributes: {
      id: number;
      name: string;
      domain: string;
      created_at: string;
      updated_at: string;
    };
  }
}

export {};

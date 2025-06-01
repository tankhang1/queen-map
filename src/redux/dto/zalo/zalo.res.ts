export type TZaloCheckRES = {
  image_url: string;
  status: number;
  message: string;
  data: {
    phone: string;
    name: string;
    zalo_user_id: string;
    role: string;
  };
  button: number;
};

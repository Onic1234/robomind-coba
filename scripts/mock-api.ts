export interface RegistrationData {
  parentName: string;
  email: string;
  childAge: string;
  spanishLevel: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    parentName: string;
    email: string;
    registeredAt: string;
  };
}

/**
 * Simulates a registration submit to a remote server.
 * Returns a delayed Promise to show loaders and interactive success states.
 */
export async function submitRegistration(
  data: RegistrationData
): Promise<RegistrationResponse> {
  return new Promise((resolve, reject) => {
    // Simulate network latency (1.5 seconds)
    setTimeout(() => {
      // Basic business logic validation
      if (!data.parentName || data.parentName.trim().length < 3) {
        return resolve({
          success: false,
          message: "Nama orang tua harus minimal 3 karakter.",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email)) {
        return resolve({
          success: false,
          message: "Format email tidak valid.",
        });
      }

      const ageNum = parseInt(data.childAge, 10);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 18) {
        return resolve({
          success: false,
          message: "Umur anak harus berupa angka antara 1 sampai 18 tahun.",
        });
      }

      if (!data.spanishLevel) {
        return resolve({
          success: false,
          message: "Pilih tingkat bahasa Spanyol anak Anda.",
        });
      }

      // Success payload simulation
      resolve({
        success: true,
        message: "Pendaftaran berhasil! Tim kami akan menghubungi Anda segera.",
        data: {
          id: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
          parentName: data.parentName.trim(),
          email: data.email.trim().toLowerCase(),
          registeredAt: new Date().toISOString(),
        },
      });
    }, 1500);
  });
}

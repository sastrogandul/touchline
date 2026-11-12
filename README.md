# Touchline Football Web

Versi web mandiri untuk Premier League, LaLiga dan Bundesliga. Tidak memerlukan Xcode, Mac yang menyala, APK, atau Supabase. Formula tetap mengikuti Touchline yang sudah ada; versi ini mengubah distribusi dan penyimpanan, bukan rumus prediksi.

## Terbitkan lewat GitHub Pages

1. Buat repository GitHub untuk Touchline. Jangan unggah folder data aplikasi pribadi dari Mac.
2. Unggah isi folder ini, termasuk `public`, `build.py` dan `.github/workflows/pages.yml`, ke branch `main`. Folder `Tests` tidak diperlukan untuk hosting.
3. Buka repository → Settings → Pages → Source → pilih **GitHub Actions**.
4. Buka tab Actions → Publish Touchline. Jika belum berjalan, pilih Run workflow.
5. Sesudah berhasil, alamat situs tampil di Settings → Pages, umumnya `https://NAMA.github.io/NAMA-REPOSITORY/`.
6. Bagikan alamat situs tersebut. Di Safari iPhone/iPad: Bagikan → Tambahkan ke Layar Utama → Buka sebagai App Web jika tersedia.

Alternatif unggah manual: isi `public` dapat diterbitkan dari branch dengan GitHub Pages. Jangan hanya unggah berkas ZIP tanpa mengekstraknya. Semua path relatif sehingga mendukung nama repository apa pun.

## Data dan pembaruan

- Saat pertama dibuka, data contoh awal dari awal November 2026 ditampilkan dengan tanggalnya. Buka Data & pembaruan → Update liga aktif untuk mengambil data terbaru. Lakukan untuk setiap liga. Bila paket lama kosong/sudah lewat, gunakan Paket terdekat baru.
- Input handicap, total gol, prediksi dan paket disimpan per liga di localStorage, setelah penulisan berhasil. Data tidak dikirim ke GitHub dan belum disinkronkan antarpengguna/perangkat.
- Data browser dapat hilang jika data situs dihapus, aplikasi dihapus, mode privat ditutup, atau penyimpanan dibersihkan sistem. Gunakan Ekspor jurnal per liga; impor kembali di liga yang sama.
- Pemasangan ke Home Screen dan tab Safari dapat mempunyai penyimpanan berbeda. Ekspor/impor jika data tidak ikut terbawa.
- Service worker menyimpan antarmuka, logo dan data awal untuk offline setelah pemasangan cache selesai. Klasemen/jurnal terakhir dibaca dari penyimpanan lokal. Update pertandingan/detail baru tetap memerlukan internet.
- Pembaruan aplikasi tidak menghapus jurnal. Versi baru menunggu semua jendela Touchline ditutup sebelum aktif, agar input yang belum disimpan tidak terganggu.
- ESPN diakses langsung melalui HTTPS; endpoint yang diuji mengizinkan CORS. Jika sumber berubah/tidak tersedia, aplikasi menampilkan kegagalan dan mempertahankan data tersimpan. Tidak ada jaminan ketersediaan API pihak ketiga.

## Pemeriksaan lokal

`python3 build.py` memperbarui daftar aset offline dan versi cache berbasis isi.

`python3 -m http.server 4180 --directory public` untuk pratinjau pengembangan, bukan alamat untuk dibagikan.

`node Tests/persistence.cjs` memakai jsdom dari proyek TouchlineAndroid di sebelah folder ini. Menguji tiga liga, simpan/buka ulang, koma/desimal, handicap dahulu, pemisahan data, kegagalan penyimpanan dan retry. Tanggal fixture dikunci agar jadwal uji tidak kedaluwarsa.

Belum diuji di Safari iPhone/iPad fisik dan belum diterbitkan ke GitHub Pages.

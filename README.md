# SiagaBengkulu — WebGIS Jalur Evakuasi Bencana

## 1. Deskripsi Proyek

SiagaBengkulu adalah prototipe WebGIS untuk menampilkan titik evakuasi simulasi di Kota Bengkulu. Aplikasi menggabungkan peta interaktif, pencarian lokasi, data kapasitas dummy, ringkasan statistik, dan demonstrasi pencarian titik terdekat menggunakan lokasi browser.

> **Peringatan penting:** proyek ini hanya demo akademik. Nama, koordinat, dan kapasitas merupakan data simulasi, bukan informasi resmi. Peta ini tidak boleh digunakan sebagai panduan evakuasi, penentuan lokasi aman, atau pengambilan keputusan saat bencana.

## 2. Latar Belakang

Informasi lokasi yang hanya disajikan sebagai teks atau tabel tidak selalu mudah dipahami secara spasial. Pengguna mungkin kesulitan melihat posisi relatif antar lokasi dan membandingkan atribut setiap titik. WebGIS menyajikan data lokasi pada peta serta menghubungkannya dengan daftar dan ringkasan kapasitas.

Proyek ini merupakan contoh penerapan Human-Computer Interaction (HCI) dan Data Visualization. Fokusnya adalah cara menyajikan informasi dan mengevaluasi interaksi, bukan menyediakan layanan kebencanaan operasional.

## 3. Tujuan

1. Menampilkan titik evakuasi simulasi pada peta interaktif.
2. Menyediakan pencarian berdasarkan nama titik atau kawasan.
3. Menyajikan kapasitas dummy dalam kartu detail dan ringkasan.
4. Mendemonstrasikan pencarian titik terdekat berdasarkan jarak garis lurus.
5. Menerapkan prinsip HCI seperti status sistem yang terlihat, pengenalan informasi, konsistensi, dan pencegahan kesalahan.
6. Menjelaskan keterbatasan data dan membedakan demonstrasi jarak dari rute evakuasi sebenarnya.

## 4. Data

Data yang digunakan berada di `data/titik_evakuasi.geojson`. Dataset demo berisi enam titik, dengan kapasitas yang dibuat untuk keperluan simulasi.

| ID | Nama titik | Kawasan simulasi | Kapasitas |
|---:|---|---|---:|
| 1 | Titik Evakuasi A | Teluk Segara | 180 orang |
| 2 | Titik Evakuasi B | Ratu Samban | 250 orang |
| 3 | Titik Evakuasi C | Ratu Agung | 140 orang |
| 4 | Titik Evakuasi D | Singaran Pati | 320 orang |
| 5 | Titik Evakuasi E | Nusa Indah, Ratu Samban | 210 orang |
| 6 | Titik Evakuasi F | Bajak, Teluk Segara | 160 orang |

Koordinat titik E dan F dipindahkan ke area jalan yang dipetakan di daratan agar marker tampak berada di darat pada peta. Pemindahan tersebut hanya koreksi visual untuk demo; titik-titik ini bukan lokasi penampungan yang telah diverifikasi. Nama kawasan, koordinat, dan kapasitas tetap tidak boleh dianggap sebagai data evakuasi resmi.

GeoJSON menggunakan struktur `FeatureCollection`. Setiap feature menyimpan nama, kawasan, kapasitas simulasi, dan geometri `Point` dengan koordinat dalam urutan `[longitude, latitude]`.

## 5. Metode dan Tahapan Pengembangan

### 5.1 Pemuatan dan Validasi Data

- Aplikasi mengambil GeoJSON menggunakan Fetch API.
- Setiap feature diperiksa agar memiliki geometri titik, koordinat numerik, dan kapasitas numerik yang tidak negatif.
- Jika data gagal dimuat atau tidak valid, pesan status ditampilkan pada antarmuka dan detail kesalahan dicatat di console browser.
- Ringkasan statistik dihitung dari data yang berhasil dimuat, bukan ditulis terpisah sebagai angka statis.

### 5.2 Pencarian Lokasi

Kata kunci dicocokkan dengan nama titik dan nama kawasan secara tidak peka huruf besar/kecil. Daftar diperbarui saat pengguna mengetik. Memilih item pada daftar memusatkan peta ke marker terkait dan menampilkan kapasitasnya.

### 5.3 Estimasi Titik Terdekat

Browser Geolocation API digunakan untuk meminta koordinat perangkat dengan izin pengguna. Rumus Haversine menghitung perkiraan jarak geodesik garis lurus antara koordinat pengguna dan tiap titik. Titik dengan jarak terpendek dipilih, bersama lingkaran yang menggambarkan akurasi GPS jika tersedia.

Jarak garis lurus bukan jarak perjalanan. Aplikasi tidak menghitung jalan, waktu tempuh, kelayakan akses, kondisi bahaya, maupun tingkat keselamatan lokasi.

### 5.4 Visualisasi

- Marker bernomor menghubungkan titik pada peta dengan item pada daftar.
- Warna marker terpilih berbeda untuk menunjukkan status pilihan.
- Kartu detail menyajikan kawasan, koordinat, dan kapasitas simulasi.
- Panel ringkasan menunjukkan jumlah titik, kapasitas total, rata-rata, nilai terbesar, dan nilai terkecil.
- Garis putus-putus hanya ilustrasi visual untuk menghubungkan marker, bukan jalan atau rute evakuasi.

## 6. Hasil Analisis Data

Angka berikut dihitung dari enam nilai kapasitas dummy: 180, 250, 140, 320, 210, dan 160 orang.

### 6.1 Ringkasan Kapasitas

| Informasi | Hasil |
|---|---:|
| Jumlah titik simulasi | 6 |
| Total kapasitas simulasi | 1.260 orang |
| Rata-rata kapasitas | 210 orang per titik |
| Median kapasitas | 195 orang |
| Kapasitas minimum | 140 orang (Titik C) |
| Kapasitas maksimum | 320 orang (Titik D) |
| Rentang kapasitas | 180 orang |

Titik D menyumbang sekitar 25,4% dari total kapasitas dummy, sedangkan Titik C sekitar 11,1%. Titik A, C, dan F berada di bawah rata-rata; Titik E sama dengan rata-rata; Titik B dan D berada di atas rata-rata. Nilai rata-rata yang lebih besar daripada median menunjukkan bahwa kapasitas Titik D yang relatif tinggi menarik rata-rata ke atas.

Interpretasi ini hanya menjelaskan dataset contoh. Enam titik dummy tidak cukup untuk menarik kesimpulan tentang pemerataan kapasitas, kebutuhan penduduk, maupun kondisi evakuasi nyata di Bengkulu.

### 6.2 Interpretasi Spasial

Peta mempermudah pengenalan posisi relatif titik dan pemilihan lokasi melalui marker maupun daftar. Namun, posisi marker pada peta dasar tidak membuktikan bahwa suatu tempat aman, memiliki fasilitas memadai, atau dapat dicapai melalui rute tertentu.

## 7. Hubungan dengan HCI dan Data Visualization

### 7.1 Penerapan HCI

| Prinsip | Penerapan |
|---|---|
| Visibility of system status | Status pemuatan, pencarian, pemilihan titik, dan permintaan lokasi ditampilkan di panel. |
| Recognition rather than recall | Marker bernomor, nama, kapasitas, dan legenda membantu pengguna mengenali informasi tanpa mengingat kode. |
| User control | Pengguna dapat mencari, memilih marker atau item daftar, mengganti layer peta, dan mengulang permintaan lokasi. |
| Consistency | Warna, gaya marker, tombol, kartu detail, dan statistik mengikuti pola visual yang seragam. |
| Error prevention | Peringatan data dummy dan penjelasan batasan jarak membantu mencegah aplikasi disangka sebagai panduan resmi. |
| Accessibility and feedback | Input pencarian memiliki label, status menggunakan area live announcement, dan kontrol utama berupa elemen tombol. |

### 7.2 Penerapan Data Visualization

Peta digunakan untuk menunjukkan distribusi spasial. Marker bernomor menghubungkan representasi geografis dengan daftar lokasi, sementara kartu ringkasan memungkinkan perbandingan jumlah dan kapasitas. Nilai minimum, maksimum, rata-rata, median, dan rentang membantu menjelaskan distribusi sederhana tanpa membuat klaim berlebihan.

Kapasitas ditampilkan sebagai atribut data simulasi, bukan indikator tingkat keamanan. Garis putus-putus diberi keterangan bahwa ia hanya ilustrasi, sehingga tidak disalahartikan sebagai jaringan jalan.

## 8. Struktur Proyek

```text
studi-kasus-jalur-evakuasi-bencana/
├── index.html
├── style.css
├── script.js
├── README.md
├── .vscode/
│   └── launch.json
└── data/
    └── titik_evakuasi.geojson
```

## 9. Teknologi dan Cara Menjalankan

### 9.1 Teknologi

- HTML untuk struktur halaman.
- CSS untuk desain responsif.
- JavaScript untuk interaksi, validasi, statistik, dan perhitungan jarak.
- Leaflet.js untuk peta dan marker.
- OpenStreetMap untuk tile peta jalan; layer satelit disediakan Esri.
- GeoJSON untuk menyimpan titik dan atribut simulasi.
- Browser Geolocation API untuk demonstrasi lokasi pengguna.

### 9.2 Persyaratan

- Browser modern.
- Koneksi internet untuk memuat pustaka Leaflet dan tile peta.
- VS Code dengan ekstensi Live Server, atau web server lokal lain.
- Izin lokasi browser jika ingin mencoba fitur titik terdekat. Geolokasi biasanya memerlukan konteks aman seperti `localhost` atau HTTPS.

### 9.3 Menjalankan Aplikasi

1. Buka folder proyek di VS Code.
2. Buka `index.html`.
3. Klik kanan dan pilih **Open with Live Server**.
4. Izinkan akses lokasi hanya jika ingin menguji fitur pencarian titik terdekat.

Hindari membuka file langsung dengan skema `file://`, karena browser dapat membatasi permintaan Fetch ke GeoJSON.

## 10. Keterbatasan dan Pengembangan Lanjutan

1. Nama, koordinat, dan kapasitas adalah data dummy; tidak berasal dari survei maupun validasi BPBD.
2. Penempatan marker di daratan hanya pemeriksaan visual terhadap peta dasar, bukan verifikasi lokasi penampungan.
3. Haversine menghitung jarak garis lurus dan tidak mempertimbangkan jaringan jalan, medan, aksesibilitas, atau hambatan.
4. Aplikasi tidak memiliki data bahaya, kondisi langsung, kapasitas tersisa, maupun routing.
5. Tile peta, pustaka eksternal, dan fitur geolokasi bergantung pada koneksi, layanan pihak ketiga, dan izin browser.
6. Garis pada peta merupakan ilustrasi, bukan rute yang dapat diikuti.

Untuk pengembangan ke sistem yang lebih nyata, data lokasi dan kapasitas perlu divalidasi dengan BPBD serta pengelola fasilitas. Diperlukan pula data ancaman dan jaringan jalan yang sesuai, pembaruan operasional, uji aksesibilitas, serta peninjauan rute oleh pihak berwenang. Informasi hanya boleh dipublikasikan setelah sumber, izin, dan prosedur pembaruannya jelas.

Evaluasi usability dapat dilakukan kepada 3–5 peserta. Minta mereka mencari sebuah lokasi, memilih titik dengan kapasitas terbesar, dan mencoba fitur terdekat menggunakan lokasi simulasi atau izin yang sadar. Catat tingkat keberhasilan, waktu tugas, kesalahan, dan apakah peserta memahami bahwa jarak yang ditampilkan bukan rute aman. Jangan meminta peserta menggunakan aplikasi ini dalam keadaan darurat nyata.

## 11. Kesimpulan

SiagaBengkulu mendemonstrasikan bagaimana peta, pencarian, daftar, kartu informasi, dan statistik dapat menyajikan data lokasi dengan lebih mudah dipahami. Pada dataset dummy, terdapat enam titik dengan total kapasitas 1.260 orang, rata-rata 210 orang, median 195 orang, serta rentang kapasitas 140–320 orang.

Prototipe ini berguna sebagai bahan studi HCI dan Data Visualization, tetapi belum layak menjadi sistem informasi evakuasi operasional. Validasi data dan rute oleh pihak berwenang, sumber data yang dapat dipercaya, dan evaluasi keselamatan merupakan prasyarat sebelum penggunaan nyata.

const InformationCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
    {/* Pengenalan */}
    <div className="border-l-4 border-blue-500 pl-4">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Panduan Pembuatan Kartu Sales Call</h2>
      <p className="text-gray-600">Form ini membantu Anda membuat kartu sales call yang seimbang untuk setiap pelabuhan dalam simulasi. Kartu-kartu ini mewakili kontrak pengiriman yang harus dipenuhi oleh pemain.</p>
    </div>

    {/* Parameter Utama */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Parameter Utama</h3>

      <div className="grid grid-cols-1 gap-4">
        {/* Jumlah Pelabuhan */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800">1. Total Pelabuhan (4-8)</h4>
          <p className="text-gray-600 mb-2">Pilih berapa banyak pelabuhan yang akan aktif dalam simulasi.</p>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm">Contoh:</p>
            <ul className="list-disc pl-4 text-sm text-gray-600">
              <li>4 pelabuhan: SBY, MKS, MDN, JYP (Simulasi Standar)</li>
              <li>6 pelabuhan: Ditambah BPN, BKS (Lebih Kompleks)</li>
              <li>8 pelabuhan: Ditambah BGR, BTH (Paling Kompleks)</li>
            </ul>
          </div>
        </div>

        {/* Parameter Pendapatan */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800">2. Pendapatan Per Pelabuhan (Default: 250 Juta)</h4>
          <p className="text-gray-600 mb-2">Total pendapatan yang akan dibagi ke kartu sales di setiap pelabuhan.</p>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm">Contoh dengan 250 Juta per pelabuhan:</p>
            <ul className="list-disc pl-4 text-sm text-gray-600">
              <li>Kartu 1: 100 Juta (Kontrak Besar)</li>
              <li>Kartu 2: 75 Juta (Kontrak Menengah)</li>
              <li>Kartu 3: 75 Juta (Kontrak Menengah)</li>
            </ul>
          </div>
        </div>

        {/* Jumlah Kontainer */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800">3. Kontainer Per Pelabuhan (Default: 15)</h4>
          <p className="text-gray-600 mb-2">Total kontainer yang akan dibagi ke kartu sales di setiap pelabuhan.</p>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm">Contoh dengan 15 kontainer:</p>
            <ul className="list-disc pl-4 text-sm text-gray-600">
              <li>Kartu 1: 6 kontainer (40%)</li>
              <li>Kartu 2: 5 kontainer (33%)</li>
              <li>Kartu 3: 4 kontainer (27%)</li>
            </ul>
          </div>
        </div>

        {/* Pengaturan Variasi */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800">4. Pengaturan Variasi</h4>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-white p-3 rounded border">
              <p className="font-medium text-sm">Variasi Jumlah (Default: 1)</p>
              <p className="text-sm text-gray-600">Mengatur variasi jumlah kontainer:</p>
              <ul className="list-disc pl-4 text-xs text-gray-600">
                <li>Rendah (0.5): Distribusi merata</li>
                <li>Tinggi (2.0): Distribusi beragam</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium text-sm">Variasi Harga (Default: 500rb)</p>
              <p className="text-sm text-gray-600">Mengatur variasi harga:</p>
              <ul className="list-disc pl-4 text-xs text-gray-600">
                <li>Rendah: Harga relatif sama</li>
                <li>Tinggi: Harga sangat bervariasi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Contoh Kartu */}
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-gray-800 mb-2">Contoh Kartu yang Dihasilkan</h3>
      <div className="bg-blue-50 p-3 rounded">
        <p className="text-sm">
          <span className="font-medium">Rute:</span> SBY → MKS
        </p>
        <p className="text-sm">
          <span className="font-medium">Tipe:</span> Kontainer Kering
        </p>
        <p className="text-sm">
          <span className="font-medium">Jumlah:</span> 5 kontainer
        </p>
        <p className="text-sm">
          <span className="font-medium">Total Pendapatan:</span> Rp 75.000.000
        </p>
        <p className="text-sm">
          <span className="font-medium">Pendapatan/Kontainer:</span> Rp 15.000.000
        </p>
      </div>
    </div>

    {/* Tips */}
    <div className="bg-green-50 p-4 rounded-lg">
      <h3 className="font-medium text-green-800 mb-2">Rekomendasi</h3>
      <ul className="list-disc pl-4 text-sm text-green-700">
        <li>Mulai dengan 4 pelabuhan untuk pemain baru</li>
        <li>Gunakan 250 Juta dan 15 kontainer untuk simulasi yang seimbang</li>
        <li>Jaga variasi tetap rendah untuk hasil yang lebih terprediksi</li>
        <li>Tingkatkan nilai secara bertahap seiring pengalaman pemain</li>
      </ul>
    </div>

    {/* Tipe Kontainer */}
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h3 className="font-medium text-yellow-800 mb-2">Tipe Kontainer</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-yellow-700">Kontainer Kering (Dry)</h4>
          <ul className="list-disc pl-4 text-sm text-yellow-700">
            <li>Biaya lebih rendah</li>
            <li>Untuk barang umum</li>
            <li>80% dari total kartu</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-yellow-700">Kontainer Pendingin (Reefer)</h4>
          <ul className="list-disc pl-4 text-sm text-yellow-700">
            <li>Biaya lebih tinggi</li>
            <li>Untuk barang beku/dingin</li>
            <li>20% dari total kartu</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default InformationCard;

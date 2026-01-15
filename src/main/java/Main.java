import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;

public class Main {

    private static final String API_KEY_REMOVE_BG = "KpwZhm86MJmUdsdhX67fNAQn";
    private static final Scanner teclado = new Scanner(System.in);

    public static void main(String[] args) {
        File pastaEntrada = new File("imagem/input");
        File pastaSaida = new File("imagem/output");
        if (!pastaSaida.exists()) pastaSaida.mkdirs();

        File[] imagens = pastaEntrada.listFiles((dir, name) ->
                name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".jpeg"));

        if (imagens == null || imagens.length == 0) return;

        int contadorItem = 1;
        for (File img : imagens) {
            String nomeBase = img.getName().replace(".jpg", "").replace(".jpeg", "");
            try {
                File imgSemFundo = new File(pastaSaida, nomeBase + "_no_bg.png");
                removerFundo(img, imgSemFundo);

                System.out.println("\n--- 📦 Produto " + contadorItem + ": " + nomeBase + " ---");
                System.out.print("💰 Valor DE: ");
                String precoDe = teclado.nextLine();
                System.out.print("🔥 Valor POR: ");
                String precoPor = teclado.nextLine();

                File arquivoArte = new File(pastaSaida, nomeBase + "_STORY.png");
                criarArteFinal(imgSemFundo, arquivoArte, precoDe, precoPor, nomeBase, contadorItem);

                System.out.println("✅ Arte com fonte Ultra unificada gerada!");
                contadorItem++;
            } catch (Exception e) { e.printStackTrace(); }
        }
    }

    private static void criarArteFinal(File imgProduto, File output, String de, String por, String codigo, int num) throws IOException {
        int width = 1080;
        int height = 1920;
        BufferedImage canvas = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = canvas.createGraphics();

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // --- CARREGAMENTO DA FONTE ULTRA (Para tudo agora) ---
        Font fontUltra = carregarFonte(".ttf/Ultra-Regular.ttf", 100);

        // 1. Fundo
        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, width, height);

        // CORES
        Color roxoSolido = new Color(145, 130, 213);
        Color roxoTransparente = new Color(145, 130, 213, 128); // 50% opacidade

        // 2. TEXTO TOPO
        g.setColor(new Color(110, 110, 110));
        g.setFont(fontUltra.deriveFont(26f));
        centralizarTexto(g, "PEÇA O LINK NOS COMENTÁRIOS", width, 120);

        // 3. CÓDIGO DO PRODUTO (Agora usando ULTRA)
        g.setColor(roxoSolido);
        g.setFont(fontUltra.deriveFont(85f)); // Ajustado para 85 para não ficar largo demais
        centralizarTexto(g, codigo.toUpperCase(), width, 250);

        // 4. NÚMERO SEQUENCIAL (Ultra)
        g.setColor(new Color(80, 80, 80));
        g.setFont(fontUltra.deriveFont(110f));
        int yNumero = 390;
        centralizarTexto(g, String.format("%02d", num), width, yNumero);

        // --- POSIÇÕES DOS PREÇOS ---
        int yPrecoDe = 1480;
        int yPrecoPor = 1660;

        // 5. IMAGEM DO PRODUTO (Centralização Automática entre Número e Preço)
        BufferedImage produto = ImageIO.read(imgProduto);
        int pW = 850;
        int pH = (produto.getHeight() * pW) / produto.getWidth();
        int espacoInicio = yNumero + 40;
        int espacoFim = yPrecoDe - 80;
        int centroY = espacoInicio + (espacoFim - espacoInicio) / 2;
        int yImg = centroY - (pH / 2);
        g.drawImage(produto, (width - pW) / 2, yImg, pW, pH, null);

        // 6. PREÇO ANTIGO (Roxo 50% opacidade)
        g.setFont(fontUltra.deriveFont(114f));
        g.setColor(roxoTransparente);
        centralizarTexto(g, "R$" + de, width, yPrecoDe);

        // RISCO BRANCO
        g.setColor(Color.WHITE);
        g.setStroke(new BasicStroke(18));
        g.drawLine(150, yPrecoDe - 45, 930, yPrecoDe - 45);

        // 7. PREÇO NOVO (Roxo Sólido)
        g.setFont(fontUltra.deriveFont(145f));
        g.setColor(roxoSolido);
        centralizarTexto(g, "R$" + por, width, 1660);

        // 8. RODAPÉ
        g.setColor(new Color(100, 100, 100));
        g.setFont(fontUltra.deriveFont(32f));
        centralizarTexto(g, "COM VARIAÇÃO DE CORES", width, 1760);
        centralizarTexto(g, "@STILE_", width, 1870);

        g.dispose();
        ImageIO.write(canvas, "png", output);
    }

    private static Font carregarFonte(String caminho, float tamanho) {
        try {
            File f = new File(caminho);
            if (f.exists()) return Font.createFont(Font.TRUETYPE_FONT, f).deriveFont(tamanho);
        } catch (Exception e) { }
        return new Font("Arial", Font.BOLD, (int)tamanho);
    }

    private static void centralizarTexto(Graphics2D g, String texto, int largura, int y) {
        FontMetrics fm = g.getFontMetrics();
        int x = (largura - fm.stringWidth(texto)) / 2;
        g.drawString(texto, x, y);
    }

    private static void removerFundo(File input, File output) throws Exception {
        if (output.exists()) return;
        String boundary = "----JavaBoundary" + System.currentTimeMillis();
        URL url = new URL("https://api.remove.bg/v1.0/removebg");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setRequestProperty("X-Api-Key", API_KEY_REMOVE_BG);
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(("--" + boundary + "\r\n").getBytes());
            os.write("Content-Disposition: form-data; name=\"image_file\"; filename=\"img.jpg\"\r\n".getBytes());
            os.write("Content-Type: image/jpeg\r\n\r\n".getBytes());
            Files.copy(input.toPath(), os);
            os.write(("\r\n--" + boundary + "--\r\n").getBytes());
        }
        if (conn.getResponseCode() == 200) {
            try (InputStream is = conn.getInputStream()) {
                Files.copy(is, output.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }
}
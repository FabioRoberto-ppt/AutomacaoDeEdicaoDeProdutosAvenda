import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import javax.imageio.ImageIO;

public class GeradorStreetwear extends JFrame {

    private JTextField txtApiKey, txtPrecoDe, txtPrecoPor;
    private JTextArea logArea;
    private File pastaEntrada;

    public GeradorStreetwear() {
        // Configurações da Janela (Front-end)
        setTitle("STILE_ - Automação de Stories");
        setSize(550, 700);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        getContentPane().setBackground(new Color(245, 245, 245));

        // Painel Superior de Configurações
        JPanel pnlInput = new JPanel(new GridLayout(4, 2, 10, 10));
        pnlInput.setBorder(new EmptyBorder(20, 20, 20, 20));
        pnlInput.setOpaque(false);

        pnlInput.add(new JLabel("Chave API Remove.bg:"));
        txtApiKey = new JTextField("KpwZhm86MJmUdsdhX67fNAQn");
        pnlInput.add(txtApiKey);

        pnlInput.add(new JLabel("Valor DE (ex: 99,90):"));
        txtPrecoDe = new JTextField();
        pnlInput.add(txtPrecoDe);

        pnlInput.add(new JLabel("Valor POR (ex: 79,90):"));
        txtPrecoPor = new JTextField();
        pnlInput.add(txtPrecoPor);

        JButton btnPasta = new JButton("📁 Escolher Pasta");
        btnPasta.addActionListener(e -> escolherPasta());
        pnlInput.add(btnPasta);

        JButton btnGerar = new JButton("🚀 GERAR TUDO");
        btnGerar.setBackground(new Color(145, 130, 213));
        btnGerar.setForeground(Color.WHITE);
        btnGerar.setFont(new Font("Arial", Font.BOLD, 12));
        btnGerar.addActionListener(e -> processar());
        pnlInput.add(btnGerar);

        // Área de mensagens (Terminal)
        logArea = new JTextArea();
        logArea.setEditable(false);
        logArea.setBackground(Color.BLACK);
        logArea.setForeground(Color.GREEN);
        JScrollPane scroll = new JScrollPane(logArea);

        add(pnlInput, BorderLayout.NORTH);
        add(scroll, BorderLayout.CENTER);
    }

    private void escolherPasta() {
        JFileChooser fc = new JFileChooser();
        fc.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
        if (fc.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            pastaEntrada = fc.getSelectedFile();
            logArea.append("> Pasta selecionada: " + pastaEntrada.getAbsolutePath() + "\n");
        }
    }

    private void processar() {
        if (pastaEntrada == null) {
            JOptionPane.showMessageDialog(this, "Por favor, escolha a pasta com as fotos primeiro!");
            return;
        }

        new Thread(() -> {
            File[] fotos = pastaEntrada.listFiles((dir, name) -> name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".jpeg"));

            if (fotos == null || fotos.length == 0) {
                logArea.append("> ERRO: Nenhuma foto encontrada na pasta.\n");
                return;
            }

            File pastaSaida = new File(pastaEntrada, "ARTES_GERADAS");
            if (!pastaSaida.exists()) pastaSaida.mkdirs();

            for (int i = 0; i < fotos.length; i++) {
                try {
                    logArea.append("> Processando " + (i+1) + " de " + fotos.length + "...\n");

                    // 1. Remove Fundo
                    File semFundo = new File(pastaSaida, "temp_" + fotos[i].getName() + ".png");
                    removerFundo(fotos[i], semFundo);

                    // 2. Gera Arte
                    String nomeBase = fotos[i].getName().replace(".jpg", "").replace(".jpeg", "");
                    File finalImg = new File(pastaSaida, "STORY_" + nomeBase + ".png");
                    gerarImagemFinal(semFundo, finalImg, nomeBase, (i + 1));

                    logArea.append("> ✅ Gerado: " + finalImg.getName() + "\n");
                } catch (Exception ex) {
                    logArea.append("> ❌ Falha em " + fotos[i].getName() + ": " + ex.getMessage() + "\n");
                }
            }
            logArea.append("> 🏁 PROCESSO FINALIZADO!\n");
        }).start();
    }

    private void gerarImagemFinal(File imgPng, File output, String codigo, int num) throws IOException {
        int w = 1080, h = 1920;
        BufferedImage story = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = story.createGraphics();

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // Cores e Fonte
        Color roxo = new Color(145, 130, 213);
        Color roxo50 = new Color(145, 130, 213, 128);
        Font ultra = carregarFonte(".ttf/Ultra-Regular.ttf", 100);

        // Fundo
        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, w, h);

        // Desenhar Textos
        g.setFont(ultra.deriveFont(26f));
        g.setColor(new Color(100, 100, 100));
        centralizar(g, "PEÇA O LINK NOS COMENTÁRIOS", w, 120);

        g.setFont(ultra.deriveFont(85f));
        g.setColor(roxo);
        centralizar(g, codigo.toUpperCase(), w, 250);

        g.setFont(ultra.deriveFont(110f));
        g.setColor(new Color(80, 80, 80));
        centralizar(g, String.format("%02d", num), w, 390);

        // Imagem centralizada
        BufferedImage prod = ImageIO.read(imgPng);
        int pW = 850;
        int pH = (prod.getHeight() * pW) / prod.getWidth();
        int yImg = 390 + 40 + (((1480 - 80) - (390 + 40)) / 2) - (pH / 2);
        g.drawImage(prod, (w - pW) / 2, yImg, pW, pH, null);

        // Preços
        g.setFont(ultra.deriveFont(114f));
        g.setColor(roxo50);
        centralizar(g, "R$" + txtPrecoDe.getText(), w, 1480);

        g.setColor(Color.WHITE);
        g.setStroke(new BasicStroke(18));
        g.drawLine(150, 1480 - 45, 930, 1480 - 45);

        g.setFont(ultra.deriveFont(145f));
        g.setColor(roxo);
        centralizar(g, "R$" + txtPrecoPor.getText(), w, 1660);

        // Rodapé
        g.setFont(ultra.deriveFont(32f));
        g.setColor(new Color(100, 100, 100));
        centralizar(g, "COM VARIAÇÃO DE CORES", w, 1760);
        centralizar(g, "@STILE_", w, 1870);

        g.dispose();
        ImageIO.write(story, "png", output);
    }

    private void removerFundo(File in, File out) throws Exception {
        if (out.exists()) return;
        URL url = new URL("https://api.remove.bg/v1.0/removebg");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setRequestProperty("X-Api-Key", txtApiKey.getText());
        String bound = "---" + System.currentTimeMillis();
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + bound);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(("--" + bound + "\r\n").getBytes());
            os.write("Content-Disposition: form-data; name=\"image_file\"; filename=\"a.jpg\"\r\n\r\n".getBytes());
            Files.copy(in.toPath(), os);
            os.write(("\r\n--" + bound + "--\r\n").getBytes());
        }
        if (conn.getResponseCode() == 200) {
            try (InputStream is = conn.getInputStream()) { Files.copy(is, out.toPath(), StandardCopyOption.REPLACE_EXISTING); }
        } else { throw new Exception("Erro API: " + conn.getResponseCode()); }
    }

    private Font carregarFonte(String p, float s) {
        try { return Font.createFont(Font.TRUETYPE_FONT, new File(p)).deriveFont(s);
        } catch (Exception e) { return new Font("Arial", Font.BOLD, (int)s); }
    }

    private void centralizar(Graphics2D g, String t, int w, int y) {
        FontMetrics fm = g.getFontMetrics();
        g.drawString(t, (w - fm.stringWidth(t)) / 2, y);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new GeradorStreetwear().setVisible(true));
    }
}
# Diretório de Imagens

Este diretório contém os assets de imagem da aplicação.

## Logo Principal

**Arquivo:** `Logo3.PNG`

**Uso:** Logo principal exibido na tela de login (lado esquerdo)

**Dimensões recomendadas:** Largura máxima 280px (responsivo)

---

## Como Adicionar a Imagem Logo3.PNG

### Opção 1: Via Terminal na VM Ubuntu

```bash
# Copiar a imagem para o diretório correto
cp /caminho/para/sua/Logo3.PNG ~/projects/inwistaApp/public/imagens/

# Adicionar ao git
cd ~/projects/inwistaApp
git add public/imagens/Logo3.PNG
git commit -m "feat: Adicionar logo principal Logo3.PNG"
```

### Opção 2: Via SFTP/SCP do MacBook

```bash
# Do MacBook, copiar para a VM
scp /caminho/local/Logo3.PNG seu-usuario@192.168.1.5:~/projects/inwistaApp/public/imagens/
```

### Opção 3: Clonar de outro branch/repositório

Se a imagem já existe em outro branch:

```bash
cd ~/projects/inwistaApp
git checkout outro-branch -- public/imagens/Logo3.PNG
git add public/imagens/Logo3.PNG
```

---

## Formato Aceito

- **PNG** (recomendado para transparência)
- **JPG/JPEG** (para imagens sem transparência)
- **SVG** (vetorial, ideal para logos)

---

**Nota:** Após adicionar a imagem, recarregue a página no navegador (Ctrl+Shift+R) para ver o novo logo!

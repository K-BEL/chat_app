#!/bin/bash
# ============================================================================
# Continue-TTS Server — One-Click Installer & Launcher
# Works on Vast.ai PyTorch instances (requires NVIDIA GPU)
# ============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

PORT=${PORT:-8081}
MODEL_NAME="SVECTOR-CORPORATION/Continue-TTS"
HF_CACHE="${HF_HOME:-/workspace/.hf_home}/hub/models--SVECTOR-CORPORATION--Continue-TTS"

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}▸${NC} $1"; }
ok()    { echo -e "${GREEN}✅${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠️${NC}  $1"; }
fail()  { echo -e "${RED}❌${NC} $1"; exit 1; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🎤  Continue-TTS Server Launcher       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ─── Step 1: Detect Python ───────────────────────────────────────────────────
info "Detecting Python interpreter..."

if [ -x "/venv/main/bin/python3" ]; then
    PYTHON="/venv/main/bin/python3"
    PIP="/venv/main/bin/pip"
    ok "Using Vast.ai venv: $PYTHON"
elif command -v python3 &> /dev/null; then
    PYTHON="python3"
    PIP="pip3"
    ok "Using system Python: $(python3 --version)"
else
    fail "Python3 not found. Install Python 3.10+ or use a Vast.ai PyTorch template."
fi

# ─── Step 2: Check CUDA ─────────────────────────────────────────────────────
info "Checking GPU availability..."
$PYTHON -c "import torch; assert torch.cuda.is_available(), 'No GPU'; print(f'GPU: {torch.cuda.get_device_name(0)} ({torch.cuda.get_device_properties(0).total_mem // 1024**3}GB VRAM)')" 2>/dev/null \
    && ok "CUDA GPU detected" \
    || warn "No CUDA GPU detected — model will run on CPU (very slow)"

# ─── Step 3: Install pip dependencies ────────────────────────────────────────
info "Installing Python dependencies..."

PACKAGES="flask flask-cors numpy snac accelerate hf_transfer transformers"
$PIP install --quiet $PACKAGES 2>/dev/null || $PIP install $PACKAGES
ok "All pip packages installed"

# ─── Step 4: Download model weights (if not cached) ─────────────────────────
if [ -d "$HF_CACHE/snapshots" ]; then
    ok "Model weights already cached at $HF_CACHE"
else
    info "Downloading model weights (~15 GB, first time only)..."
    warn "This may take 5-15 minutes depending on your connection speed."
    HF_HUB_ENABLE_HF_TRANSFER=1 $PYTHON -c "
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
print('Downloading tokenizer...')
AutoTokenizer.from_pretrained('$MODEL_NAME')
print('Downloading model weights...')
AutoModelForCausalLM.from_pretrained('$MODEL_NAME', device_map='auto', dtype=torch.float16, trust_remote_code=True)
print('Done!')
"
    ok "Model weights downloaded and cached"
fi

# ─── Step 5: Free the port if occupied ───────────────────────────────────────
if command -v fuser &> /dev/null; then
    fuser -k ${PORT}/tcp 2>/dev/null && warn "Killed process occupying port $PORT" || true
fi

# ─── Step 6: Print server info ───────────────────────────────────────────────
IP=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🌐  Server Ready                       ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Local:   http://127.0.0.1:${PORT}           ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Network: http://${IP}:${PORT}    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Health:  http://127.0.0.1:${PORT}/health    ${GREEN}║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Model loads on first /tts/generate call ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Press Ctrl+C to stop                   ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ─── Step 7: Launch the server ───────────────────────────────────────────────
export PORT=$PORT
$PYTHON "$SCRIPT_DIR/tts_server_hf.py"
